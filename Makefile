
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test release

install:
	npm install

eslint:
	$(shell npm bin)/eslint render.js
	$(shell npm bin)/eslint app.js
	$(shell npm bin)/eslint data-app.js
	$(shell npm bin)/eslint utils.js

	$(shell npm bin)/eslint tests

test: install eslint

npm.version:
	git pull --tags
	npm version patch
	git push origin $(git_branch) && git push --tags

npm.publish: export LEGACY_PKG_NAME=tinyhtml
npm.publish:
	cp package.json lib
	cp README.md lib
	cp LICENSE lib
	- cd lib && npm publish --access public
	- node -e "var fs = require('fs'); var pkg = require('./lib/package.json'); pkg.name = '${LEGACY_PKG_NAME}'; fs.writeFile('lib/package.json', JSON.stringify(pkg, null, '  '), 'utf8', function (err) { if( err ) console.log('Error: ' + err); });"
	- cd lib && npm publish
	rm lib/package.json
	rm lib/README.md
	rm lib/LICENSE
	@echo "published ${PKG_VERSION}"

github.release: export LEGACY_PKG_NAME=tinyhtml
github.release: export REPOSITORY=kiltjs/tinyhtml
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )
github.release:
	@echo ${RELEASE_URL}
	@echo "\nhttps://github.com/${REPOSITORY}/releases/tag/${PKG_VERSION}\n"

release: test npm.version npm.publish github.release
