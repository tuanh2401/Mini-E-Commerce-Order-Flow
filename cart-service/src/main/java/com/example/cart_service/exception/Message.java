package com.example.cart_service.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Message {
    CART_GET_SUCCESS("success.cart.get"),
    CART_ADD_SUCCESS("success.cart.add"),
    CART_UPDATE_SUCCESS("success.cart.update"),
    CART_REMOVE_SUCCESS("success.cart.remove"),
    CART_CLEAR_SUCCESS("success.cart.clear"),
    PRODUCT_NOT_FOUND("error.cart.product.not.found"),
    CART_NOT_FOUND("error.cart.not.found"),
    CART_ITEM_NOT_FOUND("error.cart.item.not.found");
    private String message;
}
