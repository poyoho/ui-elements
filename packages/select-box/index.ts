import OptionBox from "./src/option"
import SelectBox from "./src/select"

declare global {
  interface Window {
    SelectBox: typeof SelectBox
    OptionBox: typeof OptionBox
  }
  interface HTMLElementTagNameMap {
    "select-box": SelectBox
    "option-box": OptionBox
  }
}

export function install() {
  if (!window.customElements.get("select-box")) {
    window.SelectBox = SelectBox
    window.OptionBox = OptionBox
    window.customElements.define("select-box", SelectBox)
    window.customElements.define("option-box", OptionBox)
  }
}

export type {OptionBox,SelectBox}
