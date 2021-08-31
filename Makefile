VERSION := $(shell cat VERSION)

default: build

test:
	go test ./...

build:
	go build

install: build
	mkdir -p ~/.tflint.d/plugins/github.com/kb4sre/tflint-ruleset-kb4/$(VERSION)/
	mv ./tflint-ruleset-kb4 ~/.tflint.d/plugins/github.com/kb4sre/tflint-ruleset-kb4/$(VERSION)/

release:
	git tag v$(VERSION)
	git push origin v$(VERSION)