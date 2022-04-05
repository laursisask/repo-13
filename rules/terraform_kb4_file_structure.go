package rules

import (
	"fmt"
	"log"

	"github.com/hashicorp/hcl/v2"
	"github.com/terraform-linters/tflint-plugin-sdk/hclext"
	"github.com/terraform-linters/tflint-plugin-sdk/tflint"
)

var EXPECTED_FILES []string = []string{"_init.tf", "_variables.tf", "_outputs.tf"}

// TerraformKb4FileStructureRule checks whether modules adhere to Terraform's standard module structure
type TerraformKb4FileStructureRule struct {
	tflint.DefaultRule
}

// NewTerraformKb4ModuleStructureRule returns a new rule
func NewTerraformKb4FileStructureRule() *TerraformKb4FileStructureRule {
	return &TerraformKb4FileStructureRule{}
}

// Name returns the rule name
func (r *TerraformKb4FileStructureRule) Name() string {
	return "terraform_kb4_module_structure"
}

// Enabled returns whether the rule is enabled by default
func (r *TerraformKb4FileStructureRule) Enabled() bool {
	return true
}

// Severity returns the rule severity
func (r *TerraformKb4FileStructureRule) Severity() tflint.Severity {
	return tflint.ERROR
}

// Link returns the rule reference link
func (r *TerraformKb4FileStructureRule) Link() string {
	return "https://engineering.internal.knowbe4.com/style/terraform/#standard-files-names-and-usage"
}

// Check emits errors for any missing files and any block types that are included in the wrong file
func (r *TerraformKb4FileStructureRule) Check(runner tflint.Runner) error {
	// if !runner {
	// 	// This rule does not evaluate child modules.
	// 	return nil
	// }
	// config, _ := runner.Config()
	// if len(config.Path) > 1 {
	// 	// This rule does not evaluate child modules.
	// 	return nil
	// }

	log.Printf("[TRACE] Check `%s` rule", r.Name())

	r.checkFiles(runner)
	r.checkVariables(runner)
	r.checkOutputs(runner)

	return nil
}

func (r *TerraformKb4FileStructureRule) checkFiles(runner tflint.Runner) error {
	files, err := runner.GetFiles()

	if err != nil {
		return err
	}

	for _, name := range EXPECTED_FILES {
		if files[name] == nil {
			runner.EmitIssue(
				r,
				fmt.Sprintf("Module should include a %s file.", name),
				hcl.Range{
					Filename: name,
					Start:    hcl.InitialPos,
				},
			)
		}
	}

	return nil
}

func (r *TerraformKb4FileStructureRule) checkVariables(runner tflint.Runner) error {

	content, err := runner.GetModuleContent(&hclext.BodySchema{
		Blocks: []hclext.BlockSchema{
			{
				Type:       "variable",
				LabelNames: []string{"name"},
			},
		},
	}, nil)

	if err != nil {
		return err
	}

	for _, variable := range content.Blocks {
		if variable.DefRange.Filename != "_variables.tf" {
			runner.EmitIssue(
				r,
				fmt.Sprintf("variable %q should be moved from %s to %s", variable.Labels[0], variable.DefRange.Filename, "_variables.tf"),
				variable.DefRange,
			)
		}
	}

	return nil
}

func (r *TerraformKb4FileStructureRule) checkOutputs(runner tflint.Runner) error {

	content, err := runner.GetModuleContent(&hclext.BodySchema{
		Blocks: []hclext.BlockSchema{
			{
				Type:       "output",
				LabelNames: []string{"name"},
			},
		},
	}, nil)

	if err != nil {
		return err
	}

	for _, variable := range content.Blocks {
		if variable.DefRange.Filename != "_outputs.tf" {
			runner.EmitIssue(
				r,
				fmt.Sprintf("variable %q should be moved from %s to %s", variable.Labels[0], variable.DefRange.Filename, "_outputs.tf"),
				variable.DefRange,
			)
		}
	}

	return nil
}
