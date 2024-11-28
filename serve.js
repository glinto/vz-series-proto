import * as esbuild from 'esbuild';

let ctx = await esbuild.context({
	entryPoints: ['src/index.ts'],
	format: 'esm',
	outdir: 'docs/js',
	bundle: true,
	minify: false
});

let { host, port } = await ctx.serve({
	servedir: 'docs'
});

console.log(`Serving at http://${host}:${port}`);
