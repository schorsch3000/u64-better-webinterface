.PHONY: build deploy-dev clean pretty pre-commit release local-build version


local-build: pretty build


build: dist dist/C64_Pro-STYLE.woff
	minify -r  src/ -o dist
	./checkSizeClaim.sh

release: build version
	cd dist && zip -r ../u64-better-webinterface.zip .

version: build
	sed -i  "s/{{VERSION}}/$${VERSION:-localbuild}/g" dist/index.html

dist/C64_Pro-STYLE.woff: assets/C64_Pro-STYLE.woff
	cp assets/C64_Pro-STYLE.woff dist/

assets/C64_Pro-STYLE.woff: assets
	cd assets && wget https://github.com/Smithsonian/dpo-voyager/raw/refs/heads/master/assets/fonts/C64_Pro-STYLE.woff


assets:
	mkdir -p assets

deploy-dev: build version
	find dist  -type f  -exec u64 -U "{}" /Flash/html/ \;

pretty:
	prettier --write "src/**/*"


dist: clean
	mkdir dist
clean:
	@rm -rf dist

autodeploy-dev: deploy-dev
	find -not -path "./dist/*" -not -path "./assets/*" | entr -c make deploy-dev