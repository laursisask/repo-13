package rules

import (
	"fmt"

	"github.com/hashicorp/hcl/v2"
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
	return "https://engineering.internal.knowbe4.com/style/terraform/#validation"
}

// Check checks whether variables have descriptions
func (r *TerraformValidatedVariablesRule) Check(runner tflint.Runner) error {

	files, _ := runner.GetFiles()

	for filename := range files {
		r.checkFileSchema(runner, files[filename])
	}

	// content, err := runner.GetModuleContent(&hclext.BodySchema{
	// 	Blocks: []hclext.BlockSchema{
	// 		{
	// 			Type:       "variable",
	// 			LabelNames: []string{"name"},
	// 		},
	// 	},
	// }, nil)

	// if err != nil {
	// 	return err
	// }

	// for _, block := range content.Blocks.OfType("variable") {
	// 	_, _, diags := block.Body.PartialContent(&hcl.BodySchema{
	// 		Attributes: []hcl.AttributeSchema{
	// 			{
	// 				Name:     "type",
	// 				Required: true,
	// 			},
	// 		},
	// 	})

	// 	if diags.HasErrors() {
	// 		runner.EmitIssue(
	// 			r,
	// 			fmt.Sprintf("`%v` variable has no type", block.Labels[0]),
	// 			block.DefRange,
	// 		)
	// 	}
	// }

	// for _, variable := range content.Blocks {

	// 	runner.EmitIssue(
	// 		r,
	// 		fmt.Sprintf("%+v.", variable.Labels),
	// 		variable.DefRange,
	// 	)

	// 	// _, type_exists := variable.Body.Attributes["type"]

	// 	// if !type_exists {
	// 	// 	runner.EmitIssue(
	// 	// 		r,
	// 	// 		fmt.Sprintf("`%s` variable has no type specified. Please include the type when specifying variables.", variable.Labels[0]),
	// 	// 		variable.DefRange,
	// 	// 	)
	// 	// }

	// 	// _, validation_exists := variable.Body.Attributes["validation"]

	// 	// if !validation_exists {
	// 	// 	runner.EmitIssue(
	// 	// 		r,
	// 	// 		fmt.Sprintf("`%s` variable has no validations. Please include at least 1 validation for types that are not a bool.", variable.Labels[0]),
	// 	// 		variable.DefRange,
	// 	// 	)
	// 	// }
	// }

	return nil
}

func (r *TerraformValidatedVariablesRule) checkFileSchema(runner tflint.Runner, file *hcl.File) error {

	content, _, diags := file.Body.PartialContent(&hcl.BodySchema{
		Blocks: []hcl.BlockHeaderSchema{
			{
				Type:       "variable",
				LabelNames: []string{"name"},
			},
		},
	})

	if diags.HasErrors() {
		return diags
	}

	for _, block := range content.Blocks.OfType("variable") {
		c, _, _ := block.Body.PartialContent(&hcl.BodySchema{
			Blocks: []hcl.BlockHeaderSchema{
				{
					Type: "validation",
				},
			},
		})

		if len(c.Blocks) == 0 {
			runner.EmitIssue(
				r,
				fmt.Sprintf("`%v` variable has no validations. Please include at least 1 validation for types that are not a bool.", block.Labels[0]),
				block.DefRange,
			)
		}
	}

	return nil
}
