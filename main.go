package main

import (
	"fmt"
	"io/ioutil"

	"github.com/kb4sre/tflint-ruleset-kb4/rules"
	"github.com/terraform-linters/tflint-plugin-sdk/plugin"
	"github.com/terraform-linters/tflint-plugin-sdk/tflint"
)

func main() {

	version, err := ioutil.ReadFile("VERSION") // just pass the file name
	if err != nil {
		fmt.Print(err)
	}

	plugin.Serve(&plugin.ServeOpts{
		RuleSet: &tflint.BuiltinRuleSet{
			Name:    "template",
			Version: string(version),
			Rules: []tflint.Rule{
				rules.NewTerraformValidatedVariablesRule(),
			},
		},
	})
}
