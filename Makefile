.PHONY: build deploy-dev clean pretty pre-commit


build: pretty dist dist/C64_Pro-STYLE.woff
	minify -r  src/ -o dist

dist/C64_Pro-STYLE.woff: dist
	cd dist && wget https://github.com/Smithsonian/dpo-voyager/raw/refs/heads/master/assets/fonts/C64_Pro-STYLE.woff

deploy-dev: build
	find dist  -type f  -exec u64 -U "{}" /Flash/html/ \;

pretty:
	prettier --write "src/**/*.html"


dist: clean
	mkdir dist
clean:
	@rm -rf dist
