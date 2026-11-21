import '../css/styles.scss'
import { App } from "./App";
import { Pwa } from "./Pwa";

void Pwa.registerAsync();
await App.getInstance().runAsync();
