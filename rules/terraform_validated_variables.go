package rules

import (
	"fmt"

	"github.com/terraform-linters/tflint-plugin-sdk/tflint"
)

// TerraformDocumentedVariablesRule checks whether variables have descriptions
type TerraformValidatedVariablesRule struct{}

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
func (r *TerraformValidatedVariablesRule) Severity() string {
	return tflint.ERROR
}

// Link returns the rule reference link
func (r *TerraformValidatedVariablesRule) Link() string {
	return ""
}

// Check checks whether variables have descriptions
func (r *TerraformValidatedVariablesRule) Check(runner tflint.Runner) error {
	backend, err := runner.Backend()
	config, err := runner.Config()

	if err != nil {
		return err
	}
	if backend == nil {
		return nil
	}

	for _, variable := range config.Module.Variables {
		if len(variable.Validations) == 0 {
			runner.EmitIssue(
				r,
				fmt.Sprintf("`%s` variable has no validations. Please include at least 1 validation for types that are not primitive.", variable.Name),
				variable.DeclRange,
			)
		}
	}
	return nil
}
