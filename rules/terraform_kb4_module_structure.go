package rules

import (
	"fmt"
	"log"
	"path/filepath"

	"github.com/hashicorp/hcl/v2"
	"github.com/terraform-linters/tflint-plugin-sdk/tflint"
)

const (
	filenameMain      = "_init.tf"
	filenameVariables = "_variables.tf"
	filenameOutputs   = "_outputs.tf"
)

// TerraformKb4ModuleStructureRule checks whether modules adhere to Terraform's standard module structure
type TerraformKb4ModuleStructureRule struct{}

// NewTerraformKb4ModuleStructureRule returns a new rule
func NewTerraformKb4ModuleStructureRule() *TerraformKb4ModuleStructureRule {
	return &TerraformKb4ModuleStructureRule{}
}

// Name returns the rule name
func (r *TerraformKb4ModuleStructureRule) Name() string {
	return "terraform_kb4_module_structure"
}

// Enabled returns whether the rule is enabled by default
func (r *TerraformKb4ModuleStructureRule) Enabled() bool {
	return true
}

// Severity returns the rule severity
func (r *TerraformKb4ModuleStructureRule) Severity() string {
	return tflint.ERROR
}

// Link returns the rule reference link
func (r *TerraformKb4ModuleStructureRule) Link() string {
	return ""
}

// Check emits errors for any missing files and any block types that are included in the wrong file
func (r *TerraformKb4ModuleStructureRule) Check(runner tflint.Runner) error {
	config, _ := runner.Config()
	if len(config.Path) > 1 {
		// This rule does not evaluate child modules.
		return nil
	}

	log.Printf("[TRACE] Check `%s` rule for `%s` runner", r.Name(), config.Path)

	r.checkFiles(runner)
	r.checkVariables(runner)
	r.checkOutputs(runner)

	return nil
}

func (r *TerraformKb4ModuleStructureRule) checkFiles(runner tflint.Runner) {
	config, _ := runner.Config()
	if r.onlyJSON(runner) {
		return
	}

	f, _ := runner.Files()
	files := make(map[string]*hcl.File, len(f))
	for name, file := range f {
		files[filepath.Base(name)] = file
	}

	log.Printf("[DEBUG] %d files found: %v", len(files), files)

	if files[filenameMain] == nil {
		runner.EmitIssue(
			r,
			fmt.Sprintf("Module should include a %s file as the primary entrypoint", filenameMain),
			hcl.Range{
				Filename: filepath.Join(config.Module.SourceDir, filenameMain),
				Start:    hcl.InitialPos,
			},
		)
	}

	if files[filenameVariables] == nil && len(config.Module.Variables) == 0 {
		runner.EmitIssue(
			r,
			fmt.Sprintf("Module should include an empty %s file", filenameVariables),
			hcl.Range{
				Filename: filepath.Join(config.Module.SourceDir, filenameVariables),
				Start:    hcl.InitialPos,
			},
		)
	}

	if files[filenameOutputs] == nil && len(config.Module.Outputs) == 0 {
		runner.EmitIssue(
			r,
			fmt.Sprintf("Module should include an empty %s file", filenameOutputs),
			hcl.Range{
				Filename: filepath.Join(config.Module.SourceDir, filenameOutputs),
				Start:    hcl.InitialPos,
			},
		)
	}
}

func (r *TerraformKb4ModuleStructureRule) checkVariables(runner tflint.Runner) {
	config, _ := runner.Config()
	for _, variable := range config.Module.Variables {
		if filename := variable.DeclRange.Filename; r.shouldMove(filename, filenameVariables) {
			runner.EmitIssue(
				r,
				fmt.Sprintf("variable %q should be moved from %s to %s", variable.Name, filename, filenameVariables),
				variable.DeclRange,
			)
		}
	}
}

func (r *TerraformKb4ModuleStructureRule) checkOutputs(runner tflint.Runner) {
	config, _ := runner.Config()
	for _, variable := range config.Module.Outputs {
		if filename := variable.DeclRange.Filename; r.shouldMove(filename, filenameOutputs) {
			runner.EmitIssue(
				r,
				fmt.Sprintf("output %q should be moved from %s to %s", variable.Name, filename, filenameOutputs),
				variable.DeclRange,
			)
		}
	}
}

func (r *TerraformKb4ModuleStructureRule) onlyJSON(runner tflint.Runner) bool {
	files, _ := runner.Files()

	if len(files) == 0 {
		return false
	}

	for filename := range files {
		if filepath.Ext(filename) != ".json" {
			return false
		}
	}

	return true
}

func (r *TerraformKb4ModuleStructureRule) shouldMove(path string, expected string) bool {
	// json files are likely generated and conventional filenames do not apply
	if filepath.Ext(path) == ".json" {
		return false
	}

	return filepath.Base(path) != expected
}
