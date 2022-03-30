package rules

import (
	"path/filepath"
	"testing"

	hcl "github.com/hashicorp/hcl/v2"
	"github.com/terraform-linters/tflint-plugin-sdk/helper"
)

func Test_TerraformKb4ModuleStructureRule(t *testing.T) {
	cases := []struct {
		Name     string
		Content  map[string]string
		Expected helper.Issues
	}{
		// {
		// 	Name:    "empty module",
		// 	Content: map[string]string{},
		// 	Expected: helper.Issues{
		// 		{
		// 			Rule:    NewTerraformKb4ModuleStructureRule(),
		// 			Message: "Module should include a _init.tf file as the primary entrypoint",
		// 			Range: hcl.Range{
		// 				Filename: "_init.tf",
		// 				Start:    hcl.InitialPos,
		// 			},
		// 		},
		// 		{
		// 			Rule:    NewTerraformKb4ModuleStructureRule(),
		// 			Message: "Module should include an empty _variables.tf file",
		// 			Range: hcl.Range{
		// 				Filename: "_variables.tf",
		// 				Start:    hcl.InitialPos,
		// 			},
		// 		},
		// 		{
		// 			Rule:    NewTerraformKb4ModuleStructureRule(),
		// 			Message: "Module should include an empty _outputs.tf file",
		// 			Range: hcl.Range{
		// 				Filename: "_outputs.tf",
		// 				Start:    hcl.InitialPos,
		// 			},
		// 		},
		// 	},
		// },
		{
			Name: "missing outputs file",
			Content: map[string]string{
				"_init.tf":      `terraform {}`,
				"_variables.tf": `variable "v" {}`,
				// "_outputs.tf": `variable "v" {}`,
			},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: "Module should include a _outputs.tf file.",
					Range: hcl.Range{
						Filename: filepath.Join("_outputs.tf"),
						Start:    hcl.InitialPos,
					},
				},
			},
		},
		{
			Name: "missing variables file",
			Content: map[string]string{
				"_init.tf": `terraform {}`,
				// "_variables.tf": `variable "some_variable" {}`,
				"_outputs.tf": `output "some_output" {}`,
			},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: "Module should include a _variables.tf file.",
					Range: hcl.Range{
						Filename: filepath.Join("_variables.tf"),
						Start:    hcl.InitialPos,
					},
				},
			},
		},
		{
			Name: "missing init file",
			Content: map[string]string{
				// "_init.tf": `terraform {}`,
				"_variables.tf": `variable "some_variable" {}`,
				"_outputs.tf":   `output "some_output" {}`,
			},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: "Module should include a _init.tf file.",
					Range: hcl.Range{
						Filename: filepath.Join("_init.tf"),
						Start:    hcl.InitialPos,
					},
				},
			},
		},
		{
			Name: "no missing files",
			Content: map[string]string{
				"_init.tf":      `terraform {}`,
				"_variables.tf": `variable "some_variable" {}`,
				"_outputs.tf":   `output "some_output" {}`,
			},
			Expected: helper.Issues{},
		},
		{
			Name: "move variable",
			Content: map[string]string{
				"_init.tf":      `variable "misplace_variable" {}`,
				"_variables.tf": `variable "some_variable" {}`,
				"_outputs.tf":   `output "some_output" {}`,
			},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: `variable "misplace_variable" should be moved from _init.tf to _variables.tf`,
					Range: hcl.Range{
						Filename: "_init.tf",
						Start: hcl.Pos{
							Line:   1,
							Column: 1,
						},
						End: hcl.Pos{
							Line:   1,
							Column: 29,
						},
					},
				},
			},
		},
		///////////////
		// {
		// 	Name: "move output",
		// 	Content: map[string]string{
		// 		"main.tf":       `output "o" { value = null }`,
		// 		"_variables.tf": "",
		// 		"_outputs.tf":   "",
		// 	},
		// 	Expected: helper.Issues{
		// 		{
		// 			Rule:    NewTerraformKb4ModuleStructureRule(),
		// 			Message: `output "o" should be moved from main.tf to _outputs.tf`,
		// 			Range: hcl.Range{
		// 				Filename: "main.tf",
		// 				Start: hcl.Pos{
		// 					Line:   2,
		// 					Column: 1,
		// 				},
		// 				End: hcl.Pos{
		// 					Line:   2,
		// 					Column: 11,
		// 				},
		// 			},
		// 		},
		// 	},
		// },
		// {
		// 	Name: "json only",
		// 	Content: map[string]string{
		// 		"main.tf.json": "{}",
		// 	},
		// 	Expected: helper.Issues{},
		// },
		// {
		// 	Name: "json variable",
		// 	Content: map[string]string{
		// 		"main.tf.json": `{"variable": {"v": {}}}`,
		// 	},
		// 	Expected: helper.Issues{},
		// },
		// {
		// 	Name: "json output",
		// 	Content: map[string]string{
		// 		"main.tf.json": `{"output": {"o": {"value": null}}}`,
		// 	},
		// 	Expected: helper.Issues{},
		// },
		/////////////////////

	}

	rule := NewTerraformKb4ModuleStructureRule()

	for _, tc := range cases {
		tc := tc
		t.Run(tc.Name, func(t *testing.T) {
			runner := helper.TestRunner(t, tc.Content)

			if err := rule.Check(runner); err != nil {
				t.Fatalf("Unexpected error occurred: %s", err)
			}

			helper.AssertIssues(t, tc.Expected, runner.Issues)
		})
	}
}
