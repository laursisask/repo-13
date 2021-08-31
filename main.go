package main

import (
	"github.com/kb4sre/tflint-ruleset-kb4/rules"
	"github.com/terraform-linters/tflint-plugin-sdk/plugin"
	"github.com/terraform-linters/tflint-plugin-sdk/tflint"
)

func main() {
	plugin.Serve(&plugin.ServeOpts{
		RuleSet: &tflint.BuiltinRuleSet{
			Name:    "template",
			Version: "0.1.3",
			Rules: []tflint.Rule{
				rules.NewTerraformValidatedVariablesRule(),
			},
		},
	})
}
