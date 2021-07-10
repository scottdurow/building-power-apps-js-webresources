/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
        new TerserPlugin({
            terserOptions: {
                compress: {
                    // Power Apps Solution Checker will complain if strict equality operators
                    // are optimised, rule: web-use-strict-equality-operators
                    // see https://docs.microsoft.com/en-us/powerapps/maker/data-platform/use-powerapps-checker#best-practice-rules-used-by-solution-checker
                    comparisons: false
                }
            }
        })
    ]
  }  
});
