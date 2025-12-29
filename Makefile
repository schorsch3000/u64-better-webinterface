.PHONY: build deploy-dev clean pretty pre-commit release local-build


local-build: pretty build


build: dist dist/C64_Pro-STYLE.woff
	minify -r  src/ -o dist

release: build

dist/C64_Pro-STYLE.woff: assets/C64_Pro-STYLE.woff
	cp assets/C64_Pro-STYLE.woff dist/

assets/C64_Pro-STYLE.woff: assets
	cd assets && wget https://github.com/Smithsonian/dpo-voyager/raw/refs/heads/master/assets/fonts/C64_Pro-STYLE.woff


assets:
	mkdir -p assets

deploy-dev: build
	find dist  -type f  -exec u64 -U "{}" /Flash/html/ \;

pretty:
	prettier --write "src/**/*.html"


dist: clean
	mkdir dist
clean:
	@rm -rf dist
