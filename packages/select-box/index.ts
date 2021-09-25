import SelectBox from "./src/select"
import OptionBox from "./src/option"

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

export type {SelectBox, OptionBox}
