
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test release

install:
	npm install

eslint:
	$(shell npm bin)/eslint app.js
	$(shell npm bin)/eslint render.js
	$(shell npm bin)/eslint utils.js

build:
	# $(shell npm bin)/rollup app.js --output.format cjs --output.file dist/app.cjs.js
	$(shell npm bin)/rollup app.js --output.format umd --output.file dist/app.umd.js -n APP -c rollup.config.js

test: install eslint build
	$(shell npm bin)/karma start karma.conf.js

npm.publish:
ifndef NPM_VERSION
  export NPM_VERSION=patch
endif
npm.publish:
	echo "building ${NPM_VERSION}"
	git pull --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch) && git push --tags
	npm publish --access public

github.release: export REPOSITORY=triskeljs/app
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )
github.release:
	@echo ${RELEASE_URL}
	@echo "\nhttps://github.com/${REPOSITORY}/releases/tag/${PKG_VERSION}\n"

release: test npm.publish github.release
