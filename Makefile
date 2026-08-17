# @nqlib/nqui — npm publish shortcuts
# Usage:
#   make login
#   make verify          # build + packed consumer types + lint + test + pack check
#   make prove-showcase  # install tarball in ../nqui-showcase and tsc -b (restores lockfile)
#   make publish-next    # npm publish --tag next (does not move latest)
#   make promote         # npm dist-tag add <version> latest
#   make publish         # public latest — runs prove-showcase first when sibling exists
#   make publish OTP=123456

REGISTRY := https://registry.npmjs.com
PKG_DIR  := .
PKG_NAME := @nqlib/nqui
VERSION  := $(shell node -p "require('./package.json').version")
SHOWCASE := $(abspath ../nqui-showcase)

.PHONY: help login whoami verify prove-showcase publish publish-next promote version publish-github publish-both

help:
	@echo "nqui npm publish"
	@echo ""
	@echo "  make login              npm web login (opens browser)"
	@echo "  make whoami             show logged-in npm user"
	@echo "  make version            local package.json vs npm latest / next"
	@echo "  make verify             build:lib + packed consumer tsc + lint + test + pack check"
	@echo "  make prove-showcase     pack tarball, typecheck ../nqui-showcase, restore lockfile"
	@echo "  make publish-next       publish $(PKG_NAME) with dist-tag next (not latest)"
	@echo "  make promote            move $(PKG_NAME)@$(VERSION) to dist-tag latest"
	@echo "  make publish            prove-showcase (if sibling exists) then publish latest"
	@echo "  make publish OTP=CODE   publish latest with 2FA one-time password"
	@echo "  make publish-github     publish to GitHub Packages"
	@echo "  make publish-both       publish to GitHub Packages then npmjs.com"
	@echo ""
	@echo "Do not ship latest until packed types pass. --tag next is still public;"
	@echo "semver ranges like ^0.7.9 will install it. Prefer prove-showcase, then latest."
	@echo ""
	@echo "See .cursor/commands/publish.md and docs/meta/publishing.md"

login:
	npm login --auth-type=web --registry=$(REGISTRY)

whoami:
	@npm whoami --registry=$(REGISTRY) 2>/dev/null || \
		(echo "Not logged in. Run: make login" && exit 1)

version:
	@echo "local:  $(VERSION)"
	@echo "latest: $$(npm view $(PKG_NAME) version --registry=$(REGISTRY) 2>/dev/null || echo '(not published)')"
	@echo "next:   $$(npm view $(PKG_NAME) dist-tags.next --registry=$(REGISTRY) 2>/dev/null || echo '(none)')"

verify:
	npm run verify:publish

prove-showcase:
	node scripts/prove-showcase.mjs

publish-next: whoami
ifdef OTP
	NPM_CONFIG_OTP=$(OTP) NPM_DIST_TAG=next npm run publish:npm
else
	NPM_DIST_TAG=next npm run publish:npm
endif

promote: whoami
	npm dist-tag add $(PKG_NAME)@$(VERSION) latest --registry=$(REGISTRY)
	@echo "promoted $(PKG_NAME)@$(VERSION) -> latest"

publish: whoami
	@if [ -d "$(SHOWCASE)" ]; then \
		node scripts/prove-showcase.mjs; \
	else \
		echo "No sibling nqui-showcase at $(SHOWCASE) — packed consumer types still run in prepublishOnly"; \
	fi
ifdef OTP
	NPM_CONFIG_OTP=$(OTP) npm run publish:npm
else
	npm run publish:npm
endif

publish-github: whoami
	npm run publish:github

publish-both: whoami
	npm run publish:both
