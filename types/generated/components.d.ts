import type { Struct, Schema } from "@strapi/strapi";

export interface ComponentsHomeHomeBrands extends Struct.ComponentSchema {
    collectionName: "components_components_home_home_brands";
    info: {
        displayName: "homeBrands";
    };
    attributes: {
        name: Schema.Attribute.String;
        href: Schema.Attribute.String;
        image: Schema.Attribute.Media<"images">;
    };
}

export interface ComponentsHomeHomeAbout extends Struct.ComponentSchema {
    collectionName: "components_components_home_home_abouts";
    info: {
        displayName: "homeAbout";
    };
    attributes: {
        title: Schema.Attribute.Text;
        description: Schema.Attribute.RichText;
        miniTitle: Schema.Attribute.String;
        image: Schema.Attribute.Media<"images">;
    };
}

export interface ComponentsCoursesHeroCourses extends Struct.ComponentSchema {
    collectionName: "components_components_courses_hero_courses";
    info: {
        displayName: "heroCourses";
    };
    attributes: {
        title: Schema.Attribute.String;
        description: Schema.Attribute.String;
        image: Schema.Attribute.Media<"images">;
    };
}

export interface ComponentsCoursesBlockCourses extends Struct.ComponentSchema {
    collectionName: "components_components_courses_block_courses";
    info: {
        displayName: "blockCourses";
        description: "";
    };
    attributes: {
        title: Schema.Attribute.String;
        content: Schema.Attribute.RichText;
        image: Schema.Attribute.Media<"images">;
    };
}

export interface ComponentsContactsContactsBlock
    extends Struct.ComponentSchema {
    collectionName: "components_components_contacts_contacts_blocks";
    info: {
        displayName: "contactsBlock";
        description: "";
    };
    attributes: {
        label: Schema.Attribute.String;
        contactsBlockContent: Schema.Attribute.Component<
            "components-contacts.contacts-block-content",
            true
        >;
    };
}

export interface ComponentsContactsContactsBlockContent
    extends Struct.ComponentSchema {
    collectionName: "components_components_contacts_contacts_block_contents";
    info: {
        displayName: "contactsBlockContent";
    };
    attributes: {
        content: Schema.Attribute.RichText;
    };
}

export interface ComponentsBaseLink extends Struct.ComponentSchema {
    collectionName: "components_components_base_links";
    info: {
        displayName: "link";
    };
    attributes: {
        label: Schema.Attribute.String;
        href: Schema.Attribute.String;
    };
}

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

export interface ComponentsBaseFooterSocials extends Struct.ComponentSchema {
    collectionName: "components_components_base_footer_socials";
    info: {
        displayName: "footerSocials";
        description: "";
    };
    attributes: {
        text: Schema.Attribute.String;
        link: Schema.Attribute.Component<"components-base.link", true>;
    };
}

export interface ComponentsBaseFooterNavigation extends Struct.ComponentSchema {
    collectionName: "components_components_base_footer_navigations";
    info: {
        displayName: "footerNavigation";
        description: "";
    };
    attributes: {
        footerColumn: Schema.Attribute.Component<
            "components-base.footer-column",
            true
        >;
        footerSocials: Schema.Attribute.Component<
            "components-base.footer-socials",
            false
        >;
    };
}

export interface ComponentsBaseFooterColumn extends Struct.ComponentSchema {
    collectionName: "components_components_base_footer_columns";
    info: {
        displayName: "footerColumn";
        description: "";
    };
    attributes: {
        label: Schema.Attribute.String;
        link: Schema.Attribute.Component<"components-base.link", true>;
    };
}

export interface ComponentsTimetableEntity extends Struct.ComponentSchema {
    collectionName: "components_components_timetable_entities";
    info: {
        displayName: "timetableEntity";
        description: "";
    };
    attributes: {
        title: Schema.Attribute.String;
        level: Schema.Attribute.String;
        price: Schema.Attribute.String;
        date: Schema.Attribute.DateTime;
        href: Schema.Attribute.String;
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

export interface ComponentsHeroSlider extends Struct.ComponentSchema {
    collectionName: "components_components_hero_sliders";
    info: {
        displayName: "heroSlider";
        description: "";
    };
    attributes: {
        image: Schema.Attribute.Media<"images">;
        title: Schema.Attribute.String;
        description: Schema.Attribute.String;
        btnText: Schema.Attribute.String;
        btnHref: Schema.Attribute.String;
        imageMobile: Schema.Attribute.Media<"images">;
    };
}

export interface ComponentsHeaderLink extends Struct.ComponentSchema {
    collectionName: "components_components_header_links";
    info: {
        displayName: "headerLink";
        description: "";
    };
    attributes: {
        label: Schema.Attribute.String;
        href: Schema.Attribute.String;
    };
}

export interface BrandComponentsBrandHero extends Struct.ComponentSchema {
    collectionName: "components_brand_components_brand_heroes";
    info: {
        displayName: "brandHero";
    };
    attributes: {
        title: Schema.Attribute.String;
        description: Schema.Attribute.String;
        image: Schema.Attribute.Media<"images">;
    };
}

export interface BrandComponentsBrandAbout extends Struct.ComponentSchema {
    collectionName: "components_brand_components_brand_abouts";
    info: {
        displayName: "brandAbout";
        description: "";
    };
    attributes: {
        title: Schema.Attribute.String;
        miniTitle: Schema.Attribute.String;
        image: Schema.Attribute.Media<"images">;
        descriptionTitle: Schema.Attribute.Text;
        descriptionText: Schema.Attribute.RichText;
    };
}

declare module "@strapi/strapi" {
    export module Public {
        export interface ComponentSchemas {
            "components-home.home-brands": ComponentsHomeHomeBrands;
            "components-home.home-about": ComponentsHomeHomeAbout;
            "components-courses.hero-courses": ComponentsCoursesHeroCourses;
            "components-courses.block-courses": ComponentsCoursesBlockCourses;
            "components-contacts.contacts-block": ComponentsContactsContactsBlock;
            "components-contacts.contacts-block-content": ComponentsContactsContactsBlockContent;
            "components-base.link": ComponentsBaseLink;
            "components-base.label-with-boolean": ComponentsBaseLabelWithBoolean;
            "components-base.footer-socials": ComponentsBaseFooterSocials;
            "components-base.footer-navigation": ComponentsBaseFooterNavigation;
            "components-base.footer-column": ComponentsBaseFooterColumn;
            "components.timetable-entity": ComponentsTimetableEntity;
            "components.skin-type2": ComponentsSkinType2;
            "components.seo": ComponentsSeo;
            "components.product-list": ComponentsProductList;
            "components.hero-slider": ComponentsHeroSlider;
            "components.header-link": ComponentsHeaderLink;
            "brand-components.brand-hero": BrandComponentsBrandHero;
            "brand-components.brand-about": BrandComponentsBrandAbout;
        }
    }
}
