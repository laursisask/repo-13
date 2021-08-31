# TFLint Ruleset


## Requirements

- TFLint v0.30+
- Go v1.16

## Installation

You can install the plugin with `tflint --init`. Declare a config in `.tflint.hcl` as follows:

```hcl
plugin "ruleset" {
  enabled = true

  version = "0.1.0"
  source  = "github.com/kb4sre/tflint-ruleset-plugin"
}
```

## Rules

|Name|Description|Severity|Enabled|Link|
| --- | --- | --- | --- | --- |
|terraform_validated_variables|Rule for insuring all variables have validation.|ERROR|✔||

## Building the plugin

Clone the repository locally and run the following command:

```
$ make
```

You can easily install the built plugin with the following:

```
$ make install
```
