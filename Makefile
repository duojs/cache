
NODE ?= node
NODE_FLAGS ?= $(shell $(NODE) --v8-options | grep generators | cut -d ' ' -f 3)

BIN := ./node_modules/.bin
ESLINT ?= $(BIN)/eslint
MOCHA ?= $(BIN)/_mocha


test: node_modules
	@$(NODE) $(NODE_FLAGS) $(MOCHA)

node_modules: package.json
	@npm install

lint:
	@$(ESLINT) .


.PHONY: test
