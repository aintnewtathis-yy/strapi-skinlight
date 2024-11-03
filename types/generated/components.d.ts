import type { Struct, Schema } from "@strapi/strapi";

export interface ComponentsBaseLabelWithBoolean extends Struct.ComponentSchema {
    collectionName: "components_components_base_label_with_booleans";
    info: {
        displayName: "labelWithBoolean";
    };
    attributes: {
        label: Schema.Attribute.String;
        boolean: Schema.Attribute.Boolean;
    };
}

export interface ComponentsSkinType2 extends Struct.ComponentSchema {
    collectionName: "components_components_skin_type2s";
    info: {
        displayName: "skinType";
        description: "";
    };
    attributes: {
        all: Schema.Attribute.Boolean;
        fat: Schema.Attribute.Boolean;
        combined: Schema.Attribute.Boolean;
        normal: Schema.Attribute.Boolean;
        dehydrated: Schema.Attribute.Boolean;
        dry: Schema.Attribute.Boolean;
        sensitive: Schema.Attribute.Boolean;
    };
}

export interface ComponentsSeo extends Struct.ComponentSchema {
    collectionName: "components_components_seos";
    info: {
        displayName: "SEO";
    };
    attributes: {
        title: Schema.Attribute.String;
        description: Schema.Attribute.Text;
        image: Schema.Attribute.Media<"images">;
        slug: Schema.Attribute.String;
    };
}

export interface ComponentsProductList extends Struct.ComponentSchema {
    collectionName: "components_components_product_lists";
    info: {
        displayName: "productList";
        description: "";
    };
    attributes: {
        product: Schema.Attribute.Relation<"oneToOne", "api::product.product">;
        quantity: Schema.Attribute.Integer;
        title: Schema.Attribute.String;
    };
}

declare module "@strapi/strapi" {
    export module Public {
        export interface ComponentSchemas {
            "components-base.label-with-boolean": ComponentsBaseLabelWithBoolean;
            "components.skin-type2": ComponentsSkinType2;
            "components.seo": ComponentsSeo;
            "components.product-list": ComponentsProductList;
        }
    }
}
