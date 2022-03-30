package rules

import (
	"fmt"

	"github.com/terraform-linters/tflint-plugin-sdk/hclext"
	"github.com/terraform-linters/tflint-plugin-sdk/tflint"
)

// TerraformDocumentedVariablesRule checks whether variables have descriptions
type TerraformValidatedVariablesRule struct {
	tflint.DefaultRule
}

// NewTerraformValidatedVariablesRule returns a new rule
func NewTerraformValidatedVariablesRule() *TerraformValidatedVariablesRule {
	return &TerraformValidatedVariablesRule{}
}

// Name returns the rule name
func (r *TerraformValidatedVariablesRule) Name() string {
	return "terraform_validated_variables"
}

// Enabled returns whether the rule is enabled by default
func (r *TerraformValidatedVariablesRule) Enabled() bool {
	return true
}

// Severity returns the rule severity
func (r *TerraformValidatedVariablesRule) Severity() tflint.Severity {
	return tflint.ERROR
}

// Link returns the rule reference link
func (r *TerraformValidatedVariablesRule) Link() string {
	return ""
}

// Check checks whether variables have descriptions
func (r *TerraformValidatedVariablesRule) Check(runner tflint.Runner) error {

	content, err := runner.GetModuleContent(&hclext.BodySchema{
		Blocks: []hclext.BlockSchema{
			{
				Type:       "variable",
				LabelNames: []string{"validation"},
			},
		},
	}, nil)

	if err != nil {
		return err
	}

	for _, variable := range content.Blocks {

		// _, type_exists := variable.Body.Attributes["type"]

		// if !type_exists {
		// 	runner.EmitIssue(
		// 		r,
		// 		fmt.Sprintf("`%s` variable has no type specified. Please include the type when specifying variables.", variable.Labels[0]),
		// 		variable.DefRange,
		// 	)
		// }

		_, validation_exists := variable.Body.Attributes["validation"]

		if !validation_exists {
			runner.EmitIssue(
				r,
				fmt.Sprintf("`%s` variable has no validations. Please include at least 1 validation for types that are not a bool.", variable.Labels[0]),
				variable.DefRange,
			)
		}
	}

	return nil
}
