/* eslint-disable class-methods-use-this */
import createError, { createErrrorFieldTypeMismatch, createErrorMissingRequiredField } from '../../../error';

import { isUrl } from '../../../utils';
import isRuleEnabled from '../../utils';
import AbstractVisitor from '../../utils/AbstractVisitor';

class ValidateOpenAPIExternalDocumentation extends AbstractVisitor {
  static get ruleName() {
    return 'external-docs';
  }

  validators() {
    return {
      description: (node, ctx) => (node && node.description && typeof node.description !== 'string' ? createErrrorFieldTypeMismatch('string', node, ctx, { fromRule: this.rule, severity: this.config.level }) : null),
      url: (node, ctx) => {
        if (node && !node.url) return createErrorMissingRequiredField('url', node, ctx, { fromRule: this.rule, severity: this.config.level });
        if (!isUrl(node.url)) return createError('url must be a valid URL', node, ctx, { fromRule: this.rule, target: 'value', severity: this.config.level });
        return null;
      },
    };
  }

  OpenAPIExternalDocumentation() {
    return {
      onEnter: (node, definition, ctx) => {
        const result = [];
        const validators = this.validators();
        const vals = Object.keys(validators);
        for (let i = 0; i < vals.length; i += 1) {
          if (isRuleEnabled(this.config, vals[i])) {
            ctx.path.push(vals[i]);
            const res = validators[vals[i]](node, ctx, this.config);
            if (res) {
              if (Array.isArray(res)) result.push(...res);
              else result.push(res);
            }
            ctx.path.pop();
          }
        }
        return result;
      },
    };
  }
}

module.exports = ValidateOpenAPIExternalDocumentation;