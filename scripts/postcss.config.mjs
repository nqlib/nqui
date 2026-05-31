import postcssImport from 'postcss-import';
import discardComments from 'postcss-discard-comments';

export default {
  plugins: [
    postcssImport(),
    discardComments({ removeAll: true }),
  ],
};

