package com.example.product_service.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Message {
    PRODUCT_CREATE_SUCCESS("product.create.success"),
    PRODUCT_LIST_SUCCESS("product.list.success"),
    PRODUCT_DETAIL_SUCCESS("product.detail.success"),
    PRODUCT_UPDATE_SUCCESS("product.update.success"),
    PRODUCT_DELETE_SUCCESS("product.delete.success"),
    PRODUCT_REDUCE_STOCK_SUCCESS("product.reduce_stock.success"),
    PRODUCT_NOT_FOUND("product.not.found"),
    PRODUCT_STOCK_INSUFFICIENT("product.stock.sufficient"),
    CATEGORY_CREATE_SUCCESS("category.create.success"),
    CATEGORY_LIST_SUCCESS("category.list.success"),
    CATEGORY_DETAIL_SUCCESS("category.detail.success"),
    CATEGORY_UPDATE_SUCCESS("category.update.success"),
    CATEGORY_DELETE_SUCCESS("category.delete.success"),
    CATEGORY_NOT_FOUND("category.not.found"),
    CATEGORY_ALREADY_EXISTS("category.already.exists"),
    CATEGORY_HAS_PRODUCTS("category.has.products"),
    FAVORITE_ADD_SUCCESS("favorite.add.success"),
    FAVORITE_REMOVE_SUCCESS("favorite.remove.success"),
    PRODUCT_ALREADY_FAVORITED("product.already.favorited"),
    FAVORITE_LIST_SUCCESS("favorite.list.success"),
    FAVORITE_STATUS_SUCCESS("favorite.status.success"),
    REVIEW_ADD_SUCCESS("review.add.success"),
    REVIEW_UPDATE_SUCCESS("review.update.success"),
    REVIEW_DELETE_SUCCESS("review.delete.success"),
    REVIEW_NOT_FOUND("review.not.found"),
    REVIEW_ALREADY_EXISTS("review.already.exists"),
    REVIEW_UNAUTHORIZED("review.unauthorized"),
    REVIEW_LIST_SUCCESS("review.list.success"),
    REVIEW_SUMMARY_SUCCESS("review.summary.success"),
    REVIEW_NOT_PURCHASED("review.not.purchased"),
    SUCCESS_VIEW_ANALYTICS("success.analytics.view");

    private final String message;
}
