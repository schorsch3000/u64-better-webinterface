.PHONY: build deploy-dev clean pretty pre-commit


build: pretty dist
	minify src/index.html > dist/index.html

deploy-dev: build
	u64 -u dist/index.html /Flash/html/i2.html

pretty:
	prettier --write "src/**/*.html"


dist: clean
	mkdir dist
clean:
	@rm -rf dist
