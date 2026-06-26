# @nqlib/nqui — npm publish shortcuts
# Usage:
#   make login
#   make verify          # optional — publish runs build:lib via prepublishOnly
#   make publish
#   make publish OTP=123456   # when npm asks for 2FA

REGISTRY := https://registry.npmjs.com
PKG_DIR  := .
PKG_NAME := @nqlib/nqui

.PHONY: help login whoami verify publish version publish-github publish-both

help:
	@echo "nqui npm publish"
	@echo ""
	@echo "  make login              npm web login (opens browser)"
	@echo "  make whoami             show logged-in npm user"
	@echo "  make version            local package.json vs npm latest"
	@echo "  make verify             build:lib + lint + test + pack check"
	@echo "  make publish            publish $(PKG_NAME) to npmjs.com"
	@echo "  make publish OTP=CODE   publish with 2FA one-time password"
	@echo "  make publish-github     publish to GitHub Packages"
	@echo "  make publish-both       publish to GitHub Packages then npmjs.com"
	@echo ""
	@echo "See .cursor/commands/publish.md and internal-notes/PUBLISHING.md"

login:
	npm login --auth-type=web --registry=$(REGISTRY)

whoami:
	@npm whoami --registry=$(REGISTRY) 2>/dev/null || \
		(echo "Not logged in. Run: make login" && exit 1)

version:
	@echo "local:  $$(node -p "require('./package.json').version")"
	@echo "npm:    $$(npm view $(PKG_NAME) version --registry=$(REGISTRY) 2>/dev/null || echo '(not published)')"

verify:
	npm run verify:publish

publish: whoami
ifdef OTP
	NPM_CONFIG_OTP=$(OTP) npm run publish:npm
else
	npm run publish:npm
endif

publish-github: whoami
	npm run publish:github

publish-both: whoami
	npm run publish:both
