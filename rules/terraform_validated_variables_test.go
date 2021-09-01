package rules

import (
	"testing"

	hcl "github.com/hashicorp/hcl/v2"
	"github.com/terraform-linters/tflint-plugin-sdk/helper"
)

func Test_TerraformDocumentedVariablesRule(t *testing.T) {
	cases := []struct {
		Name     string
		Content  string
		Expected helper.Issues
	}{
		{
			Name:    "no validation",
			Content: `variable "no_validation" {}`,
			Expected: helper.Issues{
				{
					Rule:    NewTerraformValidatedVariablesRule(),
					Message: "`no_validation` variable has no validations. Please include at least 1 validation for types that are not a bool.",
					Range: hcl.Range{
						Filename: "variables.tf",
						Start:    hcl.Pos{Line: 1, Column: 1},
						End:      hcl.Pos{Line: 1, Column: 25},
					},
				},
			},
		},
		// 		{
		// 			Name: "bool doesnt need validations",
		// 			Content: `variable "as_bool" {
		//   type = bool
		// }`,
		// 			Expected: helper.Issues{},
		// 		},
	}

	rule := NewTerraformValidatedVariablesRule()

	for _, tc := range cases {
		runner := helper.TestRunner(t, map[string]string{"variables.tf": tc.Content})

		if err := rule.Check(runner); err != nil {
			t.Fatalf("Unexpected error occurred: %s", err)
		}

		helper.AssertIssues(t, tc.Expected, runner.Issues)
	}
}
