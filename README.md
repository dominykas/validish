# Validish

A framework[ish] to check if data is valid[ish]

I didn't have time to look for one that satisfied all of my needs, so I wrote one for a project and extracted the code.

## Todo (P1)

* Remove dependency on Q (replace with an optional dependency on ANY Promises/A+ lib)
* Remove dependency on lodash
* Hook up to the browser via browserify and via require.js
* maxLength/minLength are really numeric

## Neverdo

* Support IE8

## Requirements (where this is/was going)

* Parameterized messages / i18n
* Validation context: other form data; user status
* Async only
* Validate one field to display in UI while the user is typing
* Re-validate one field to display in UI after the user finished typing (blur)
* Validate one field based on value of another field (e.g. compare passwords, price mandatory for offers)
* Emptiness is an error during/after submit, but not during typing
* Parallel validation - e.g. check length and regex at the same time
* Sequential validation - e.g. only check regex if not empty
* Validate all fields in UI before submit
* Validate all fields on server side
* UI: jump to error field during submit if invalid
* UI: field state - invalid, valid, warning, checking
* Async validation of field may finish than the validation of the same field as part of the form - needs to be handled
* fieldValidationResult = f(value, context, config)
* Co-dependent fields (e.g. isOffer=yes/no vs price required)

## Notes

I currently have no idea what these scribbles were meant to be:
* describe fields
* describe generic validators for fields
* inject specific validators for fields
* run validation on the object
* client side: run validation on field
* client side: run validation on all fields, but ensure existing validations get finished
