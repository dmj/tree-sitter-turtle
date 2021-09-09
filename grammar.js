module.exports = grammar({
    name: 'Turtle',
    rules: {
        source: $ => repeat($.statement),
        statement: $ => choice($.directive, seq($.triples, '.')),
        directive: $ => choice($.prefixID, $.base, $.sparqlPrefix, $.sparqlBase),
        prefixID: $ => seq('@prefix', $.PNAME_NS, $.IRIREF, '.'),
        base: $ => seq('@base', $.IRIREF, '.'),
        sparqlBase: $ => seq('BASE', $.IRIREF),
        sparqlPrefix: $ => seq('PREFIX', $.PNAME_NS, $.IRIREF),
        triples: $ => choice(
            prec.left(2, seq($.subject, $.predicateObjectList)),
            prec.left(1, seq($.blankNodePropertyList, optional($.predicateObjectList)))
        ),
        predicateObjectList: $ => seq(
            $.verb, $.objectList, repeat(seq(';', seq($.verb, $.objectList)))
        ),
        objectList: $ => seq($.object, repeat(seq(',', $.object))),
        verb: $ => choice($.predicate, 'a'),
        subject: $ => choice($.iri, $.BlankNode, $.collection),
        predicate: $ => $.iri,
        object: $ => choice($.iri, $.BlankNode, $.collection, $.blankNodePropertyList, $.literal),
        literal: $ => choice($.RDFLiteral, $.NumericalLiteral, $.BooleanLiteral),
        blankNodePropertyList: $ => seq('[', $.predicateObjectList, ']'),
        collection: $ => seq('(', $.object, ')'),
        NumericalLiteral: $ => choice($.INTEGER, $.DECIMAL, $.DOUBLE),
        RDFLiteral: $ => seq($.String, optional(choice($.LANGTAG, seq('^^', $.iri)))),
        BooleanLiteral: $ => choice('true', 'false'),
        String: $ => choice(
            // TODO: Long quoted string literals aka """ and '''
            $.STRING_LITERAL_QUOTE,
            $.STRING_LITERAL_SINGLE_QUOTE
        ),
        iri: $ => choice($.IRIREF, $.PrefixedName),
        PrefixedName: $ => choice(
            prec.left(1, $.PNAME_LN),
            prec.left(2, $.PNAME_NS)
        ),
        BlankNode: $ => choice($.BLANK_NODE_LABEL, $.ANON),

        // Terminals
        IRIREF: $ => /<[^>]+>/,
        PNAME_NS: $ => /([\w][\w.]*)?:/,
        PNAME_LN: $ => /([\w][\w.]*)?:\S+/,
        BLANK_NODE_LABEL: $ => /_:\S+/,
        LANGTAG: $ => /@[a-zA-Z]+(-[a-zA-Z0-9]+)*/,
        INTEGER: $ => /[+-]?[0-9]+/,
        DECIMAL: $ => /[+-]?[0-9]+\.[0-9]+/,
        DOUBLE: $ => /[+-]?([0-9]+\.[0-9]*[eE][+-]?[0-9]+ | \.[0-9]+[eE][+-]?[0-9]+ | [0-9]+[eE][+-]?[0-9]+)/,
        ANON: $ => /\[\s*\]/,
        STRING_LITERAL_QUOTE: $ => /"[^"]*"/,
        STRING_LITERAL_SINGLE_QUOTE: $ => /'[^']*'/,
    }
});
