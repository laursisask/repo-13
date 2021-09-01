package rules

import (
	"path/filepath"
	"testing"

	"github.com/hashicorp/hcl/v2"
	"github.com/terraform-linters/tflint-plugin-sdk/helper"
)

func Test_TerraformKb4ModuleStructureRule(t *testing.T) {
	cases := []struct {
		Name     string
		Content  map[string]string
		Expected helper.Issues
	}{
		{
			Name:    "empty module",
			Content: map[string]string{},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: "Module should include a main.tf file as the primary entrypoint",
					Range: hcl.Range{
						Filename: "main.tf",
						Start:    hcl.InitialPos,
					},
				},
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: "Module should include an empty _variables.tf file",
					Range: hcl.Range{
						Filename: "_variables.tf",
						Start:    hcl.InitialPos,
					},
				},
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: "Module should include an empty _outputs.tf file",
					Range: hcl.Range{
						Filename: "_outputs.tf",
						Start:    hcl.InitialPos,
					},
				},
			},
		},
		{
			Name: "directory in path",
			Content: map[string]string{
				"foo/main.tf":       "",
				"foo/_variables.tf": `variable "v" {}`,
			},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: "Module should include an empty _outputs.tf file",
					Range: hcl.Range{
						Filename: filepath.Join("_outputs.tf"),
						Start:    hcl.InitialPos,
					},
				},
			},
		},
		{
			Name: "move variable",
			Content: map[string]string{
				"main.tf":       `variable "v" {}`,
				"_variables.tf": "",
				"_outputs.tf":   "",
			},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4ModuleStructureRule(),
					Message: `variable "v" should be moved from main.tf to _variables.tf`,
					Range: hcl.Range{
						Filename: "main.tf",
						Start: hcl.Pos{
							Line:   1,
							Column: 1,
						},
						End: hcl.Pos{
							Line:   1,
							Column: 13,
						},
					},
				},
			},
		},
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
