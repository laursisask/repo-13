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
		{
			Name:    "empty module",
			Content: map[string]string{},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4FileStructureRule(),
					Message: "Module should include a _init.tf file.",
					Range: hcl.Range{
						Filename: "_init.tf",
						Start:    hcl.InitialPos,
					},
				},
				{
					Rule:    NewTerraformKb4FileStructureRule(),
					Message: "Module should include a _variables.tf file.",
					Range: hcl.Range{
						Filename: "_variables.tf",
						Start:    hcl.InitialPos,
					},
				},
				{
					Rule:    NewTerraformKb4FileStructureRule(),
					Message: "Module should include a _outputs.tf file.",
					Range: hcl.Range{
						Filename: "_outputs.tf",
						Start:    hcl.InitialPos,
					},
				},
			},
		},
		{
			Name: "missing outputs file",
			Content: map[string]string{
				"_init.tf":      `terraform {}`,
				"_variables.tf": `variable "v" {}`,
				// "_outputs.tf": `variable "v" {}`,
			},
			Expected: helper.Issues{
				{
					Rule:    NewTerraformKb4FileStructureRule(),
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
					Rule:    NewTerraformKb4FileStructureRule(),
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
					Rule:    NewTerraformKb4FileStructureRule(),
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
					Rule:    NewTerraformKb4FileStructureRule(),
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
	}

	rule := NewTerraformKb4FileStructureRule()

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
