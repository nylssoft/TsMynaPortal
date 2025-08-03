import '../css/styles.scss'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { LoginState, ClientInfo, AuthResult, ErrorResult } from './types';
import { Locale } from './locale';

class App {

  private locale: Locale = new Locale();

  async runAsync(): Promise<void> {
  
    await this.locale.load("en");

    await this.authenticateWithLongLivedTokenAsync();
    const loginState: LoginState | null = this.getLoginState();
    console.log("Login state:", loginState);
    if (!loginState) {
      this.renderLoginWithUsernameAndPassword();
    }
    else if (loginState.requiresPass2) {
      this.renderLoginWithPass2();
    }
    else if (App.isPinRequired()) {
      this.renderLoginWithPin();
    } else {
      console.log(`Welcome ${loginState} with tsc-watch!`);
    }
  }

  renderLoginWithUsernameAndPassword(): void {
    const parent: HTMLElement = document.body;
    App.removeAllChildren(parent);
    const loginDiv: HTMLDivElement = App.createDiv(parent, "container py-4 px-3 mx-auto");
    App.createHeading(loginDiv, 1, "text-center mb-4", this.locale.translate("HEADER_LOGIN"));
    const formElement: HTMLFormElement = App.createForm(loginDiv);
    const alertDiv: HTMLDivElement = App.createDiv(formElement);
    const divUsername: HTMLDivElement = App.createDiv(formElement, "mb-3");
    App.createLabel(divUsername, "username-id", "form-label", this.locale.translate("LABEL_NAME"));
    const inputUsername: HTMLInputElement = App.createInput(divUsername, "text", "username-id", "form-control");
    const divPassword: HTMLDivElement = App.createDiv(formElement, "mb-3");
    App.createLabel(divPassword, "password-id", "form-label", this.locale.translate("LABEL_PWD"));
    const inputPassword: HTMLInputElement = App.createInput(divPassword, "password", "password-id", "form-control");
    const buttonLogin: HTMLButtonElement = App.createButton(formElement, "submit", "login-button-id", this.locale.translate("BUTTON_LOGIN"), "btn btn-primary");

    const buttonDiv: HTMLDivElement = App.createDiv(loginDiv, "fixed-bottom footer-buttons d-flex justify-content-center gap-2 p-3");
    const germanButton: HTMLButtonElement = App.createButton(buttonDiv, "button", "german-button-id", "", "btn btn-primary");
    germanButton.addEventListener("click", async (e: MouseEvent) => {
      e.preventDefault();
      await this.locale.load("de");
      this.renderLoginWithUsernameAndPassword();
    });
    const spanGerman: HTMLSpanElement = App.createSpan(germanButton, "fi fi-de");

    const englishButton: HTMLButtonElement = App.createButton(buttonDiv, "button", "english-button-id", "", "btn btn-primary");
    englishButton.addEventListener("click", async (e: MouseEvent) => {
      e.preventDefault();
      await this.locale.load("en");
      this.renderLoginWithUsernameAndPassword();
    });
    const spanEnglish: HTMLSpanElement = App.createSpan(englishButton, "fi fi-gb");

    buttonLogin.addEventListener("click", async (e: MouseEvent) => {
      e.preventDefault();
      const username: string = inputUsername.value.trim();
      const password: string = inputPassword.value.trim();
      const requestInit: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "Username": username, "Password": password, "ClientUUID": App.getClientUuid(), "ClientName": App.getClientName() })
      };
      const resp: Response = await window.fetch("/api/pwdman/auth", requestInit);
      if (!resp.ok) {
        const errorResult: ErrorResult | null = await resp.json() as ErrorResult;
        if (errorResult) {
          App.createAlert(alertDiv, this.locale.translate(errorResult.title));
        } else {
          App.createAlert(alertDiv, "Ein unbekannter Fehler ist aufgetreten.");
        }
        return;
      }
      const authResult: AuthResult | null = await resp.json() as AuthResult;
      if (!authResult) return;
      if (authResult.requiresPin) {
        App.setPinRequired(true);
        return;
      }
      const state: LoginState = {
        "token": authResult.token,
        "userName": authResult.username,
        "requiresPass2": authResult.requiresPass2
      };
      window.sessionStorage.setItem("pwdman-state", JSON.stringify(state));
      window.localStorage.setItem("pwdman-lltoken", authResult.longLivedToken);
      console.log(`Welcome ${authResult.username}!`);
    });
  }

  renderLoginWithPass2(): void {
    console.log("Rendering login with pass2.");
  }

  renderLoginWithPin(): void {
    console.log("Rendering login with PIN.");
  }

  getLoginState(): LoginState | null {
    const str: string | null = window.sessionStorage.getItem("pwdman-state");
    if (str && str.length > 0) {
      const loginState: LoginState | undefined = JSON.parse(str) as LoginState;
      if (loginState) {
        return loginState;
      }
    }
    return null;
  }

  getAuthenticationToken(): string | null {
    const loginState: LoginState | null = this.getLoginState();
    if (loginState && !loginState.requiresPass2 && loginState.token.length > 0) {
      return loginState.token;
    }
    return null;
  }

  async authenticateWithLongLivedTokenAsync(): Promise<void> {
    const token: string | null = this.getAuthenticationToken();
    if (token || App.isPinRequired()) return;
    const lltoken: string | null = window.localStorage.getItem("pwdman-lltoken");
    if (!lltoken) return;
    const requestInit: RequestInit = { headers: { "token": lltoken, "uuid": App.getClientUuid() } };
    const resp: Response = await window.fetch("/api/pwdman/auth/lltoken", requestInit);
    if (!resp.ok) {
      window.localStorage.removeItem("pwdman-lltoken");
      return;
    }
    const authResult: AuthResult | undefined = await resp.json() as AuthResult;
    if (!authResult) return;
    if (authResult.requiresPin) {
      App.setPinRequired(true);
      return;
    }
    const state: LoginState = {
      "token": authResult.token,
      "userName": authResult.username,
      "requiresPass2": authResult.requiresPass2
    };
    window.sessionStorage.setItem("pwdman-state", JSON.stringify(state));
    window.localStorage.setItem("pwdman-lltoken", authResult.longLivedToken);
  }

  static isPinRequired(): boolean {
    return window.sessionStorage.getItem("pin-required") === "true";
  }

  static setPinRequired(required: boolean): void {
    if (!required) {
      window.sessionStorage.removeItem("pin-required");
    }
    else {
      window.sessionStorage.setItem("pin-required", "true");
    }
  }

  static getClientUuid(): string {
    const ci: string | null = window.localStorage.getItem("clientinfo");
    if (ci && ci.length > 0) {
      const clientInfo: ClientInfo | undefined = JSON.parse(ci) as ClientInfo;
      if (clientInfo) {
        return clientInfo.uuid;
      }
    }
    return "";
  }

  static getClientName(): string {
    return "TsMyProject"
  }

  static createElement(parent: HTMLElement, name: string, classid?: string, txt?: string): HTMLElement {
    const e: HTMLElement = document.createElement(name);
    if (classid) {
      e.setAttribute("class", classid);
    }
    parent.appendChild(e);
    if (txt) {
      e.textContent = txt;
    }
    return e;
  }

  static createDiv(parent: HTMLElement, classname?: string, txt?: string): HTMLDivElement {
    return App.createElement(parent, "div", classname, txt) as HTMLDivElement;
  }

  static createForm(parent: HTMLElement, classname?: string): HTMLFormElement {
    return App.createElement(parent, "form", classname) as HTMLFormElement;
  }

  static createLabel(parent: HTMLElement, forid: string, classname?: string, txt?: string): HTMLLabelElement {
    const label: HTMLLabelElement = App.createElement(parent, "label", classname) as HTMLLabelElement;
    label.setAttribute("for", forid);
    if (txt) { 
      label.textContent = txt;
    }
    return label;
  }

  static createInput(parent: HTMLElement, type: string, id: string, classname?: string, value?: string): HTMLInputElement {
    const input: HTMLInputElement = App.createElement(parent, "input", classname) as HTMLInputElement;
    input.type = type;
    input.id = id;
    if (value) {
      input.value = value;
    } 
    return input;
  }

  static createHeading(parent: HTMLElement, level: number, classname?: string, txt?: string): HTMLHeadingElement {
    const h: HTMLHeadingElement = App.createElement(parent, `h${level}`, classname) as HTMLHeadingElement;
    if (txt) { 
      h.textContent = txt;
    }
    return h;
  }

  static createButton(parent: HTMLElement, type:string, id: string, txt: string, classname?: string): HTMLButtonElement {
    const b: HTMLButtonElement = App.createElement(parent, "button", classname) as HTMLButtonElement;
    b.setAttribute("type", type);
    b.id = id;
    b.title = txt;
    b.textContent = txt;
    return b;
  }

  static createSpan(parent: HTMLElement, classname?: string, txt?: string): HTMLSpanElement {
    const span: HTMLSpanElement = App.createElement(parent, "span", classname, txt) as HTMLSpanElement;
    return span;
  }

  static createAlert(parent: HTMLElement, msg: string): HTMLDivElement {
    App.removeAllChildren(parent);
    const alertDiv: HTMLDivElement = App.createDiv(parent, "alert alert-danger alert-dismissible");
    alertDiv.setAttribute("role", "alert");
    const alertMessage: HTMLDivElement = App.createDiv(alertDiv, "", msg);
    const alertButton: HTMLButtonElement = App.createButton(alertDiv, "button", "close-alert-id", "", "btn-close");
    alertButton.setAttribute("data-bs-dismiss", "alert");
    alertButton.setAttribute("aria-label", "Close");
    return alertDiv;
  }

  static removeAllChildren(parent: HTMLElement): void {
    const node: HTMLElement = parent;
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
  }

}

const app = new App();
app.runAsync();
