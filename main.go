package main

import (
	_ "embed"

	"github.com/knowbe4/tflint-ruleset-kb4/rules"
	"github.com/terraform-linters/tflint-plugin-sdk/plugin"
	"github.com/terraform-linters/tflint-plugin-sdk/tflint"
)

//go:embed VERSION
var VERSION string

func main() {

	plugin.Serve(&plugin.ServeOpts{
		RuleSet: &tflint.BuiltinRuleSet{
			Name:    "template",
			Version: VERSION,
			Rules: []tflint.Rule{
				rules.NewTerraformValidatedVariablesRule(),
				rules.NewTerraformKb4ModuleStructureRule(),
			},
		},
	})
}
