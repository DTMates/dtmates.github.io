import { message } from "./messages.js";
export function attachValidation(root = document) {
  for (const form of root.querySelectorAll("form")) {
    const check = (field) => {
      field.setCustomValidity("");
      const validity = field.validity;
      if (validity.valueMissing)
        field.setCustomValidity(message("form.required"));
      else if (validity.typeMismatch && field.type === "email")
        field.setCustomValidity(message("form.email"));
      else if (validity.tooShort)
        field.setCustomValidity(
          message("form.minLength", { min: field.minLength }),
        );
      else if (validity.tooLong)
        field.setCustomValidity(
          message("form.maxLength", { max: field.maxLength }),
        );
      else if (validity.badInput)
        field.setCustomValidity(message("form.number"));
      else if (validity.rangeUnderflow)
        field.setCustomValidity(
          message("form.min", { min: Number(field.min) }),
        );
      else if (validity.rangeOverflow)
        field.setCustomValidity(
          message("form.max", { max: Number(field.max) }),
        );
    };
    form.addEventListener("input", (e) => {
      if (e.target.setCustomValidity) check(e.target);
    });
    form.addEventListener("invalid", (e) => check(e.target), true);
  }
}
