import {
  DomSanitizer
} from "./chunk-224OF2CP.js";
import "./chunk-MNYYNOOB.js";
import {
  NgIf
} from "./chunk-GBANFASH.js";
import "./chunk-QZ2E34AJ.js";
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  Input,
  ViewChild,
  output,
  setClassMetadata,
  signal,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵqueryRefresh,
  ɵɵresetView,
  ɵɵresolveWindow,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵviewQuery
} from "./chunk-5QXQOMPN.js";
import {
  Subject,
  first,
  fromEvent,
  merge,
  takeUntil
} from "./chunk-P6U2JBMQ.js";
import {
  __async,
  __spreadProps,
  __spreadValues
} from "./chunk-WDMUDEB6.js";

// node_modules/ngx-image-cropper/fesm2022/ngx-image-cropper.mjs
var _c0 = ["wrapper"];
var _c1 = ["sourceImage"];
function ImageCropperComponent_img_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "img", 5, 0);
    ɵɵlistener("load", function ImageCropperComponent_img_1_Template_img_load_0_listener() {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.imageLoadedInView());
    })("mousedown", function ImageCropperComponent_img_1_Template_img_mousedown_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Drag));
    })("touchstart", function ImageCropperComponent_img_1_Template_img_touchstart_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Drag));
    })("error", function ImageCropperComponent_img_1_Template_img_error_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.loadImageError($event));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const src_r3 = ctx.ngIf;
    const ctx_r1 = ɵɵnextContext();
    ɵɵstyleProp("visibility", ctx_r1.imageVisible ? "visible" : "hidden")("transform", ctx_r1.safeTransformStyle());
    ɵɵclassProp("ngx-ic-draggable", !ctx_r1.disabled && ctx_r1.allowMoveImage);
    ɵɵproperty("src", src_r3, ɵɵsanitizeUrl);
    ɵɵattribute("alt", ctx_r1.imageAltText);
  }
}
function ImageCropperComponent_div_3_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = ɵɵgetCurrentView();
    ɵɵelementContainerStart(0);
    ɵɵelementStart(1, "span", 9);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_1_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "topleft"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_1_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "topleft"));
    });
    ɵɵelement(2, "span", 10);
    ɵɵelementEnd();
    ɵɵelementStart(3, "span", 11);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_3_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "topright"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_3_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "topright"));
    });
    ɵɵelement(4, "span", 10);
    ɵɵelementEnd();
    ɵɵelementStart(5, "span", 12);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_5_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottomright"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_5_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottomright"));
    });
    ɵɵelement(6, "span", 10);
    ɵɵelementEnd();
    ɵɵelementStart(7, "span", 13);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_7_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottomleft"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_7_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottomleft"));
    });
    ɵɵelement(8, "span", 10);
    ɵɵelementEnd();
    ɵɵelementStart(9, "span", 14);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_9_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "top"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_9_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "top"));
    });
    ɵɵelementEnd();
    ɵɵelementStart(10, "span", 15);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_10_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "top"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_10_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "top"));
    });
    ɵɵelement(11, "span", 10);
    ɵɵelementEnd();
    ɵɵelementStart(12, "span", 16);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_12_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "right"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_12_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "right"));
    });
    ɵɵelementEnd();
    ɵɵelementStart(13, "span", 17);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_13_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "right"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_13_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "right"));
    });
    ɵɵelement(14, "span", 10);
    ɵɵelementEnd();
    ɵɵelementStart(15, "span", 18);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_15_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottom"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_15_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottom"));
    });
    ɵɵelementEnd();
    ɵɵelementStart(16, "span", 19);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_16_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottom"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_16_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "bottom"));
    });
    ɵɵelement(17, "span", 10);
    ɵɵelementEnd();
    ɵɵelementStart(18, "span", 20);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_18_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "left"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_18_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "left"));
    });
    ɵɵelementEnd();
    ɵɵelementStart(19, "span", 21);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_ng_container_2_Template_span_mousedown_19_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "left"));
    })("touchstart", function ImageCropperComponent_div_3_ng_container_2_Template_span_touchstart_19_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Resize, "left"));
    });
    ɵɵelement(20, "span", 10);
    ɵɵelementEnd();
    ɵɵelementContainerEnd();
  }
}
function ImageCropperComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 6);
    ɵɵlistener("keydown", function ImageCropperComponent_div_3_Template_div_keydown_0_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.keyboardAccess($event));
    });
    ɵɵelementStart(1, "div", 7);
    ɵɵlistener("mousedown", function ImageCropperComponent_div_3_Template_div_mousedown_1_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Move));
    })("touchstart", function ImageCropperComponent_div_3_Template_div_touchstart_1_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.startMove($event, ctx_r1.moveTypes.Move));
    });
    ɵɵelementEnd();
    ɵɵtemplate(2, ImageCropperComponent_div_3_ng_container_2_Template, 21, 0, "ng-container", 8);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵstyleProp("top", ctx_r1.state.cropper().y1, "px")("left", ctx_r1.state.cropper().x1, "px")("width", ctx_r1.state.cropper().x2 - ctx_r1.state.cropper().x1, "px")("height", ctx_r1.state.cropper().y2 - ctx_r1.state.cropper().y1, "px")("margin-left", ctx_r1.state.options.alignImage === "center" ? ctx_r1.marginLeft : null)("visibility", ctx_r1.imageVisible ? "visible" : "hidden");
    ɵɵclassProp("ngx-ic-round", ctx_r1.state.options.roundCropper);
    ɵɵattribute("aria-label", ctx_r1.state.options.cropperFrameAriaLabel);
    ɵɵadvance(2);
    ɵɵproperty("ngIf", !ctx_r1.state.options.hideResizeSquares && !(ctx_r1.state.options.cropperStaticWidth && ctx_r1.state.options.cropperStaticHeight));
  }
}
function checkCropperPosition(cropperPosition, cropperState, maintainSize) {
  cropperPosition = checkCropperSizeRestriction(cropperPosition, cropperState);
  return checkCropperWithinMaxSizeBounds(cropperPosition, cropperState, maintainSize);
}
function checkCropperSizeRestriction(cropperPosition, cropperState) {
  let cropperWidth = cropperPosition.x2 - cropperPosition.x1;
  let cropperHeight = cropperPosition.y2 - cropperPosition.y1;
  const centerX = cropperPosition.x1 + cropperWidth / 2;
  const centerY = cropperPosition.y1 + cropperHeight / 2;
  if (cropperState.options.cropperStaticHeight && cropperState.options.cropperStaticWidth) {
    cropperWidth = cropperState.maxSize().width > cropperState.options.cropperStaticWidth ? cropperState.options.cropperStaticWidth : cropperState.maxSize().width;
    cropperHeight = cropperState.maxSize().height > cropperState.options.cropperStaticHeight ? cropperState.options.cropperStaticHeight : cropperState.maxSize().height;
  } else {
    cropperWidth = Math.max(cropperState.cropperScaledMinWidth, Math.min(cropperWidth, cropperState.cropperScaledMaxWidth, cropperState.maxSize().width));
    cropperHeight = Math.max(cropperState.cropperScaledMinHeight, Math.min(cropperHeight, cropperState.cropperScaledMaxHeight, cropperState.maxSize().height));
    if (cropperState.options.maintainAspectRatio) {
      if (cropperState.maxSize().width / cropperState.options.aspectRatio < cropperState.maxSize().height) {
        cropperHeight = cropperWidth / cropperState.options.aspectRatio;
      } else {
        cropperWidth = cropperHeight * cropperState.options.aspectRatio;
      }
    }
  }
  const x1 = centerX - cropperWidth / 2;
  const x2 = x1 + cropperWidth;
  const y1 = centerY - cropperHeight / 2;
  const y2 = y1 + cropperHeight;
  return {
    x1,
    x2,
    y1,
    y2
  };
}
function checkCropperWithinMaxSizeBounds(position, cropperState, maintainSize = false) {
  if (position.x1 < 0) {
    position = __spreadProps(__spreadValues({}, position), {
      x1: 0,
      x2: position.x2 - (maintainSize ? position.x1 : 0)
    });
  }
  if (position.y1 < 0) {
    position = __spreadProps(__spreadValues({}, position), {
      y2: position.y2 - (maintainSize ? position.y1 : 0),
      y1: 0
    });
  }
  if (position.x2 > cropperState.maxSize().width) {
    position = __spreadProps(__spreadValues({}, position), {
      x1: position.x1 - (maintainSize ? position.x2 - cropperState.maxSize().width : 0),
      x2: cropperState.maxSize().width
    });
  }
  if (position.y2 > cropperState.maxSize().height) {
    position = __spreadProps(__spreadValues({}, position), {
      y1: position.y1 - (maintainSize ? position.y2 - cropperState.maxSize().height : 0),
      y2: cropperState.maxSize().height
    });
  }
  return position;
}
function moveCropper(event, moveStart) {
  const diffX = getClientX(event) - moveStart.clientX;
  const diffY = getClientY(event) - moveStart.clientY;
  return {
    x1: moveStart.cropper.x1 + diffX,
    y1: moveStart.cropper.y1 + diffY,
    x2: moveStart.cropper.x2 + diffX,
    y2: moveStart.cropper.y2 + diffY
  };
}
function resizeCropper(event, moveStart, cropperState) {
  const cropperPosition = __spreadValues({}, cropperState.cropper());
  const moveX = getClientX(event) - moveStart.clientX;
  const moveY = getClientY(event) - moveStart.clientY;
  switch (moveStart.position) {
    case "left":
      cropperPosition.x1 = Math.min(Math.max(moveStart.cropper.x1 + moveX, cropperPosition.x2 - cropperState.cropperScaledMaxWidth), cropperPosition.x2 - cropperState.cropperScaledMinWidth);
      break;
    case "topleft":
      cropperPosition.x1 = Math.min(Math.max(moveStart.cropper.x1 + moveX, cropperPosition.x2 - cropperState.cropperScaledMaxWidth), cropperPosition.x2 - cropperState.cropperScaledMinWidth);
      cropperPosition.y1 = Math.min(Math.max(moveStart.cropper.y1 + moveY, cropperPosition.y2 - cropperState.cropperScaledMaxHeight), cropperPosition.y2 - cropperState.cropperScaledMinHeight);
      break;
    case "top":
      cropperPosition.y1 = Math.min(Math.max(moveStart.cropper.y1 + moveY, cropperPosition.y2 - cropperState.cropperScaledMaxHeight), cropperPosition.y2 - cropperState.cropperScaledMinHeight);
      break;
    case "topright":
      cropperPosition.x2 = Math.max(Math.min(moveStart.cropper.x2 + moveX, cropperPosition.x1 + cropperState.cropperScaledMaxWidth), cropperPosition.x1 + cropperState.cropperScaledMinWidth);
      cropperPosition.y1 = Math.min(Math.max(moveStart.cropper.y1 + moveY, cropperPosition.y2 - cropperState.cropperScaledMaxHeight), cropperPosition.y2 - cropperState.cropperScaledMinHeight);
      break;
    case "right":
      cropperPosition.x2 = Math.max(Math.min(moveStart.cropper.x2 + moveX, cropperPosition.x1 + cropperState.cropperScaledMaxWidth), cropperPosition.x1 + cropperState.cropperScaledMinWidth);
      break;
    case "bottomright":
      cropperPosition.x2 = Math.max(Math.min(moveStart.cropper.x2 + moveX, cropperPosition.x1 + cropperState.cropperScaledMaxWidth), cropperPosition.x1 + cropperState.cropperScaledMinWidth);
      cropperPosition.y2 = Math.max(Math.min(moveStart.cropper.y2 + moveY, cropperPosition.y1 + cropperState.cropperScaledMaxHeight), cropperPosition.y1 + cropperState.cropperScaledMinHeight);
      break;
    case "bottom":
      cropperPosition.y2 = Math.max(Math.min(moveStart.cropper.y2 + moveY, cropperPosition.y1 + cropperState.cropperScaledMaxHeight), cropperPosition.y1 + cropperState.cropperScaledMinHeight);
      break;
    case "bottomleft":
      cropperPosition.x1 = Math.min(Math.max(moveStart.cropper.x1 + moveX, cropperPosition.x2 - cropperState.cropperScaledMaxWidth), cropperPosition.x2 - cropperState.cropperScaledMinWidth);
      cropperPosition.y2 = Math.max(Math.min(moveStart.cropper.y2 + moveY, cropperPosition.y1 + cropperState.cropperScaledMaxHeight), cropperPosition.y1 + cropperState.cropperScaledMinHeight);
      break;
    case "center":
      const scale = "scale" in event ? event.scale : 1;
      const newWidth = Math.min(Math.max(cropperState.cropperScaledMinWidth, Math.abs(moveStart.cropper.x2 - moveStart.cropper.x1) * scale), cropperState.cropperScaledMaxWidth);
      const newHeight = Math.min(Math.max(cropperState.cropperScaledMinHeight, Math.abs(moveStart.cropper.y2 - moveStart.cropper.y1) * scale), cropperState.cropperScaledMaxHeight);
      cropperPosition.x1 = moveStart.clientX - newWidth / 2;
      cropperPosition.x2 = moveStart.clientX + newWidth / 2;
      cropperPosition.y1 = moveStart.clientY - newHeight / 2;
      cropperPosition.y2 = moveStart.clientY + newHeight / 2;
      if (cropperPosition.x1 < 0) {
        cropperPosition.x2 -= cropperPosition.x1;
        cropperPosition.x1 = 0;
      } else if (cropperPosition.x2 > cropperState.maxSize().width) {
        cropperPosition.x1 -= cropperPosition.x2 - cropperState.maxSize().width;
        cropperPosition.x2 = cropperState.maxSize().width;
      }
      if (cropperPosition.y1 < 0) {
        cropperPosition.y2 -= cropperPosition.y1;
        cropperPosition.y1 = 0;
      } else if (cropperPosition.y2 > cropperState.maxSize().height) {
        cropperPosition.y1 -= cropperPosition.y2 - cropperState.maxSize().height;
        cropperPosition.y2 = cropperState.maxSize().height;
      }
      break;
  }
  if (cropperState.options.maintainAspectRatio) {
    return checkAspectRatio(moveStart.position, cropperPosition, cropperState);
  } else {
    return cropperPosition;
  }
}
function checkAspectRatio(position, cropperPosition, cropperState) {
  cropperPosition = __spreadValues({}, cropperPosition);
  let overflowX = 0;
  let overflowY = 0;
  switch (position) {
    case "top":
      cropperPosition.x2 = cropperPosition.x1 + (cropperPosition.y2 - cropperPosition.y1) * cropperState.options.aspectRatio;
      overflowX = Math.max(cropperPosition.x2 - cropperState.maxSize().width, 0);
      overflowY = Math.max(0 - cropperPosition.y1, 0);
      if (overflowX > 0 || overflowY > 0) {
        cropperPosition.x2 -= overflowY * cropperState.options.aspectRatio > overflowX ? overflowY * cropperState.options.aspectRatio : overflowX;
        cropperPosition.y1 += overflowY * cropperState.options.aspectRatio > overflowX ? overflowY : overflowX / cropperState.options.aspectRatio;
      }
      break;
    case "bottom":
      cropperPosition.x2 = cropperPosition.x1 + (cropperPosition.y2 - cropperPosition.y1) * cropperState.options.aspectRatio;
      overflowX = Math.max(cropperPosition.x2 - cropperState.maxSize().width, 0);
      overflowY = Math.max(cropperPosition.y2 - cropperState.maxSize().height, 0);
      if (overflowX > 0 || overflowY > 0) {
        cropperPosition.x2 -= overflowY * cropperState.options.aspectRatio > overflowX ? overflowY * cropperState.options.aspectRatio : overflowX;
        cropperPosition.y2 -= overflowY * cropperState.options.aspectRatio > overflowX ? overflowY : overflowX / cropperState.options.aspectRatio;
      }
      break;
    case "topleft":
      cropperPosition.y1 = cropperPosition.y2 - (cropperPosition.x2 - cropperPosition.x1) / cropperState.options.aspectRatio;
      overflowX = Math.max(0 - cropperPosition.x1, 0);
      overflowY = Math.max(0 - cropperPosition.y1, 0);
      if (overflowX > 0 || overflowY > 0) {
        cropperPosition.x1 += overflowY * cropperState.options.aspectRatio > overflowX ? overflowY * cropperState.options.aspectRatio : overflowX;
        cropperPosition.y1 += overflowY * cropperState.options.aspectRatio > overflowX ? overflowY : overflowX / cropperState.options.aspectRatio;
      }
      break;
    case "topright":
      cropperPosition.y1 = cropperPosition.y2 - (cropperPosition.x2 - cropperPosition.x1) / cropperState.options.aspectRatio;
      overflowX = Math.max(cropperPosition.x2 - cropperState.maxSize().width, 0);
      overflowY = Math.max(0 - cropperPosition.y1, 0);
      if (overflowX > 0 || overflowY > 0) {
        cropperPosition.x2 -= overflowY * cropperState.options.aspectRatio > overflowX ? overflowY * cropperState.options.aspectRatio : overflowX;
        cropperPosition.y1 += overflowY * cropperState.options.aspectRatio > overflowX ? overflowY : overflowX / cropperState.options.aspectRatio;
      }
      break;
    case "right":
    case "bottomright":
      cropperPosition.y2 = cropperPosition.y1 + (cropperPosition.x2 - cropperPosition.x1) / cropperState.options.aspectRatio;
      overflowX = Math.max(cropperPosition.x2 - cropperState.maxSize().width, 0);
      overflowY = Math.max(cropperPosition.y2 - cropperState.maxSize().height, 0);
      if (overflowX > 0 || overflowY > 0) {
        cropperPosition.x2 -= overflowY * cropperState.options.aspectRatio > overflowX ? overflowY * cropperState.options.aspectRatio : overflowX;
        cropperPosition.y2 -= overflowY * cropperState.options.aspectRatio > overflowX ? overflowY : overflowX / cropperState.options.aspectRatio;
      }
      break;
    case "left":
    case "bottomleft":
      cropperPosition.y2 = cropperPosition.y1 + (cropperPosition.x2 - cropperPosition.x1) / cropperState.options.aspectRatio;
      overflowX = Math.max(0 - cropperPosition.x1, 0);
      overflowY = Math.max(cropperPosition.y2 - cropperState.maxSize().height, 0);
      if (overflowX > 0 || overflowY > 0) {
        cropperPosition.x1 += overflowY * cropperState.options.aspectRatio > overflowX ? overflowY * cropperState.options.aspectRatio : overflowX;
        cropperPosition.y2 -= overflowY * cropperState.options.aspectRatio > overflowX ? overflowY : overflowX / cropperState.options.aspectRatio;
      }
      break;
    case "center":
      cropperPosition.x2 = cropperPosition.x1 + (cropperPosition.y2 - cropperPosition.y1) * cropperState.options.aspectRatio;
      cropperPosition.y2 = cropperPosition.y1 + (cropperPosition.x2 - cropperPosition.x1) / cropperState.options.aspectRatio;
      const overflowX1 = Math.max(0 - cropperPosition.x1, 0);
      const overflowX2 = Math.max(cropperPosition.x2 - cropperState.maxSize().width, 0);
      const overflowY1 = Math.max(cropperPosition.y2 - cropperState.maxSize().height, 0);
      const overflowY2 = Math.max(0 - cropperPosition.y1, 0);
      if (overflowX1 > 0 || overflowX2 > 0 || overflowY1 > 0 || overflowY2 > 0) {
        cropperPosition.x1 += overflowY1 * cropperState.options.aspectRatio > overflowX1 ? overflowY1 * cropperState.options.aspectRatio : overflowX1;
        cropperPosition.x2 -= overflowY2 * cropperState.options.aspectRatio > overflowX2 ? overflowY2 * cropperState.options.aspectRatio : overflowX2;
        cropperPosition.y1 += overflowY2 * cropperState.options.aspectRatio > overflowX2 ? overflowY2 : overflowX2 / cropperState.options.aspectRatio;
        cropperPosition.y2 -= overflowY1 * cropperState.options.aspectRatio > overflowX1 ? overflowY1 : overflowX1 / cropperState.options.aspectRatio;
      }
      break;
  }
  return cropperPosition;
}
function getClientX(event) {
  if ("touches" in event && event.touches[0]) {
    return event.touches[0].clientX;
  } else if ("clientX" in event) {
    return event.clientX;
  }
  return 0;
}
function getClientY(event) {
  if ("touches" in event && event.touches[0]) {
    return event.touches[0].clientY;
  } else if ("clientX" in event) {
    return event.clientY;
  }
  return 0;
}
var CropperState = class {
  constructor() {
    this.cropper = signal({
      x1: 0,
      x2: 0,
      y1: 0,
      y2: 0
    });
    this.maxSize = signal({
      width: 0,
      height: 0
    });
    this.transform = {};
    this.options = {
      format: "png",
      output: "blob",
      autoCrop: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      resetCropOnAspectRatioChange: true,
      resizeToWidth: 0,
      resizeToHeight: 0,
      cropperMinWidth: 0,
      cropperMinHeight: 0,
      cropperMaxHeight: 0,
      cropperMaxWidth: 0,
      cropperStaticWidth: 0,
      cropperStaticHeight: 0,
      canvasRotation: 0,
      roundCropper: false,
      onlyScaleDown: false,
      imageQuality: 92,
      backgroundColor: void 0,
      containWithinAspectRatio: false,
      hideResizeSquares: false,
      alignImage: "center",
      cropperFrameAriaLabel: void 0,
      checkImageType: true
    };
    this.cropperScaledMinWidth = 20;
    this.cropperScaledMinHeight = 20;
    this.cropperScaledMaxWidth = 20;
    this.cropperScaledMaxHeight = 20;
    this.stepSize = 3;
  }
  setOptionsFromChanges(changes) {
    if (changes["options"]?.currentValue) {
      this.setOptions(changes["options"].currentValue);
    }
    const options = Object.entries(changes).filter(([key]) => key in this.options).reduce((acc, [key, change]) => __spreadProps(__spreadValues({}, acc), {
      [key]: change.currentValue
    }), {});
    if (Object.keys(options).length > 0) {
      this.setOptions(options);
    }
  }
  setOptions(options) {
    this.options = __spreadValues(__spreadValues({}, this.options), options || {});
    this.validateOptions();
    if (!this.loadedImage?.transformed.image.complete || !this.maxSize) {
      return;
    }
    let positionPossiblyChanged = false;
    if (this.options.maintainAspectRatio && options["aspectRatio"] || "maintainAspectRatio" in options) {
      this.setCropperScaledMinSize();
      this.setCropperScaledMaxSize();
      if (this.options.maintainAspectRatio && (this.options.resetCropOnAspectRatioChange || !this.aspectRatioIsCorrect())) {
        this.cropper.set(this.maxSizeCropperPosition());
        positionPossiblyChanged = true;
      }
    } else {
      if (options["cropperMinWidth"] || options["cropperMinHeight"]) {
        this.setCropperScaledMinSize();
        positionPossiblyChanged = true;
      }
      if (options["cropperMaxWidth"] || options["cropperMaxHeight"]) {
        this.setCropperScaledMaxSize();
        positionPossiblyChanged = true;
      }
      if (options["cropperStaticWidth"] || options["cropperStaticHeight"]) {
        positionPossiblyChanged = true;
      }
    }
    if (positionPossiblyChanged) {
      this.cropper.update((cropper) => checkCropperPosition(cropper, this, false));
    }
  }
  validateOptions() {
    if (this.options.maintainAspectRatio && !this.options.aspectRatio) {
      throw new Error("`aspectRatio` should > 0 when `maintainAspectRatio` is enabled");
    }
  }
  setMaxSize(width, height) {
    this.maxSize.set({
      width,
      height
    });
    this.setCropperScaledMinSize();
    this.setCropperScaledMaxSize();
  }
  setCropperScaledMinSize() {
    if (this.loadedImage?.transformed.size) {
      this.setCropperScaledMinWidth();
      this.setCropperScaledMinHeight();
    } else {
      this.cropperScaledMinWidth = 20;
      this.cropperScaledMinHeight = 20;
    }
  }
  setCropperScaledMinWidth() {
    this.cropperScaledMinWidth = this.options.cropperMinWidth > 0 ? Math.max(20, this.options.cropperMinWidth / this.loadedImage.transformed.size.width * this.maxSize().width) : 20;
  }
  setCropperScaledMinHeight() {
    if (this.options.maintainAspectRatio) {
      this.cropperScaledMinHeight = Math.max(20, this.cropperScaledMinWidth / this.options.aspectRatio);
    } else if (this.options.cropperMinHeight > 0) {
      this.cropperScaledMinHeight = Math.max(20, this.options.cropperMinHeight / this.loadedImage.transformed.size.height * this.maxSize().height);
    } else {
      this.cropperScaledMinHeight = 20;
    }
  }
  setCropperScaledMaxSize() {
    if (this.loadedImage?.transformed.size) {
      const ratio = this.loadedImage.transformed.size.width / this.maxSize().width;
      this.cropperScaledMaxWidth = this.options.cropperMaxWidth > 20 ? this.options.cropperMaxWidth / ratio : this.maxSize().width;
      this.cropperScaledMaxHeight = this.options.cropperMaxHeight > 20 ? this.options.cropperMaxHeight / ratio : this.maxSize().height;
      if (this.options.maintainAspectRatio) {
        if (this.cropperScaledMaxWidth > this.cropperScaledMaxHeight * this.options.aspectRatio) {
          this.cropperScaledMaxWidth = this.cropperScaledMaxHeight * this.options.aspectRatio;
        } else if (this.cropperScaledMaxWidth < this.cropperScaledMaxHeight * this.options.aspectRatio) {
          this.cropperScaledMaxHeight = this.cropperScaledMaxWidth / this.options.aspectRatio;
        }
      }
    } else {
      this.cropperScaledMaxWidth = this.maxSize().width;
      this.cropperScaledMaxHeight = this.maxSize().height;
    }
  }
  equalsCropperPosition(cropper) {
    const localCropper = this.cropper();
    return localCropper == null && cropper == null || localCropper != null && cropper != null && localCropper.x1.toFixed(3) === cropper.x1.toFixed(3) && localCropper.y1.toFixed(3) === cropper.y1.toFixed(3) && localCropper.x2.toFixed(3) === cropper.x2.toFixed(3) && localCropper.y2.toFixed(3) === cropper.y2.toFixed(3);
  }
  equalsTransformTranslate(transform) {
    return (this.transform.translateH ?? 0) === (transform.translateH ?? 0) && (this.transform.translateV ?? 0) === (transform.translateV ?? 0);
  }
  equalsTransform(transform) {
    return this.equalsTransformTranslate(transform) && (this.transform.scale ?? 1) === (transform.scale ?? 1) && (this.transform.rotate ?? 0) === (transform.rotate ?? 0) && (this.transform.flipH ?? false) === (transform.flipH ?? false) && (this.transform.flipV ?? false) === (transform.flipV ?? false);
  }
  aspectRatioIsCorrect() {
    const localCropper = this.cropper();
    const currentCropAspectRatio = (localCropper.x2 - localCropper.x1) / (localCropper.y2 - localCropper.y1);
    return currentCropAspectRatio === this.options.aspectRatio;
  }
  resizeCropperPosition(oldMaxSize) {
    if (oldMaxSize.width !== this.maxSize().width || oldMaxSize.height !== this.maxSize().height) {
      this.cropper.update((cropper) => ({
        x1: cropper.x1 * this.maxSize().width / oldMaxSize.width,
        x2: cropper.x2 * this.maxSize().width / oldMaxSize.width,
        y1: cropper.y1 * this.maxSize().height / oldMaxSize.height,
        y2: cropper.y2 * this.maxSize().height / oldMaxSize.height
      }));
    }
  }
  maxSizeCropperPosition() {
    return {
      x1: 0,
      y1: 0,
      x2: this.maxSize().width,
      y2: this.maxSize().height
    };
  }
  toCropInput() {
    return {
      cropper: this.cropper(),
      maxSize: this.maxSize(),
      transform: this.transform,
      loadedImage: this.loadedImage,
      options: __spreadValues({}, this.options)
    };
  }
};
var MoveTypes;
(function(MoveTypes2) {
  MoveTypes2["Drag"] = "drag";
  MoveTypes2["Move"] = "move";
  MoveTypes2["Resize"] = "resize";
  MoveTypes2["Pinch"] = "pinch";
})(MoveTypes || (MoveTypes = {}));
function resizeCanvas(canvas, width, height) {
  const width_source = canvas.width;
  const height_source = canvas.height;
  width = Math.round(width);
  height = Math.round(height);
  const ratio_w = width_source / width;
  const ratio_h = height_source / height;
  const ratio_w_half = Math.ceil(ratio_w / 2);
  const ratio_h_half = Math.ceil(ratio_h / 2);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const img = ctx.getImageData(0, 0, width_source, height_source);
    const img2 = ctx.createImageData(width, height);
    const data = img.data;
    const data2 = img2.data;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const x2 = (i + j * width) * 4;
        const center_y = j * ratio_h;
        let weight = 0;
        let weights = 0;
        let weights_alpha = 0;
        let gx_r = 0;
        let gx_g = 0;
        let gx_b = 0;
        let gx_a = 0;
        const xx_start = Math.floor(i * ratio_w);
        const yy_start = Math.floor(j * ratio_h);
        let xx_stop = Math.ceil((i + 1) * ratio_w);
        let yy_stop = Math.ceil((j + 1) * ratio_h);
        xx_stop = Math.min(xx_stop, width_source);
        yy_stop = Math.min(yy_stop, height_source);
        for (let yy = yy_start; yy < yy_stop; yy++) {
          const dy = Math.abs(center_y - yy) / ratio_h_half;
          const center_x = i * ratio_w;
          const w0 = dy * dy;
          for (let xx = xx_start; xx < xx_stop; xx++) {
            const dx = Math.abs(center_x - xx) / ratio_w_half;
            const w = Math.sqrt(w0 + dx * dx);
            if (w >= 1) {
              continue;
            }
            weight = 2 * w * w * w - 3 * w * w + 1;
            const pos_x = 4 * (xx + yy * width_source);
            gx_a += weight * data[pos_x + 3];
            weights_alpha += weight;
            if (data[pos_x + 3] < 255) weight = weight * data[pos_x + 3] / 250;
            gx_r += weight * data[pos_x];
            gx_g += weight * data[pos_x + 1];
            gx_b += weight * data[pos_x + 2];
            weights += weight;
          }
        }
        data2[x2] = gx_r / weights;
        data2[x2 + 1] = gx_g / weights;
        data2[x2 + 2] = gx_b / weights;
        data2[x2 + 3] = gx_a / weights_alpha;
      }
    }
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(img2, 0, 0);
  }
}
function percentage(percent, totalValue) {
  return percent / 100 * totalValue;
}
var CropService = class {
  crop(input, output2) {
    const imagePosition = this.getImagePosition(input);
    const width = imagePosition.x2 - imagePosition.x1;
    const height = imagePosition.y2 - imagePosition.y1;
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = width;
    cropCanvas.height = height;
    const ctx = cropCanvas.getContext("2d");
    if (!ctx) {
      return null;
    }
    if (input.options?.backgroundColor != null) {
      ctx.fillStyle = input.options.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    const scaleX = (input.transform?.scale || 1) * (input.transform?.flipH ? -1 : 1);
    const scaleY = (input.transform?.scale || 1) * (input.transform?.flipV ? -1 : 1);
    const {
      translateH,
      translateV
    } = this.getCanvasTranslate(input);
    const transformedImage = input.loadedImage.transformed;
    ctx.setTransform(scaleX, 0, 0, scaleY, transformedImage.size.width / 2 + translateH, transformedImage.size.height / 2 + translateV);
    ctx.translate(-imagePosition.x1 / scaleX, -imagePosition.y1 / scaleY);
    ctx.rotate((input.transform?.rotate || 0) * Math.PI / 180);
    ctx.drawImage(transformedImage.image, -transformedImage.size.width / 2, -transformedImage.size.height / 2);
    const result = {
      width,
      height,
      imagePosition,
      cropperPosition: __spreadValues({}, input.cropper)
    };
    if (input.options?.containWithinAspectRatio) {
      result.offsetImagePosition = this.getOffsetImagePosition(input);
    }
    const resizeRatio = this.getResizeRatio(width, height, input.options);
    if (resizeRatio !== 1) {
      result.width = Math.round(width * resizeRatio);
      result.height = input.options?.maintainAspectRatio ? Math.round(result.width / (input.options?.aspectRatio ?? 1)) : Math.round(height * resizeRatio);
      resizeCanvas(cropCanvas, result.width, result.height);
    }
    if (output2 === "blob") {
      return this.cropToBlob(result, cropCanvas, input);
    } else {
      result.base64 = cropCanvas.toDataURL("image/" + (input.options?.format ?? "png"), this.getQuality(input.options));
      return result;
    }
  }
  cropToBlob(output2, cropCanvas, input) {
    return __async(this, null, function* () {
      output2.blob = yield new Promise((resolve) => cropCanvas.toBlob(resolve, "image/" + (input.options?.format ?? "png"), this.getQuality(input.options)));
      if (output2.blob) {
        output2.objectUrl = URL.createObjectURL(output2.blob);
      }
      return output2;
    });
  }
  getCanvasTranslate(input) {
    if (input.transform?.translateUnit === "px") {
      const ratio = this.getRatio(input);
      return {
        translateH: (input.transform?.translateH || 0) * ratio,
        translateV: (input.transform?.translateV || 0) * ratio
      };
    } else {
      return {
        translateH: input.transform?.translateH ? percentage(input.transform.translateH, input.loadedImage.transformed.size.width) : 0,
        translateV: input.transform?.translateV ? percentage(input.transform.translateV, input.loadedImage.transformed.size.height) : 0
      };
    }
  }
  getRatio(input) {
    return input.loadedImage.transformed.size.width / input.maxSize.width;
  }
  getImagePosition(cropperState) {
    const ratio = this.getRatio(cropperState);
    const out = {
      x1: Math.round(cropperState.cropper.x1 * ratio),
      y1: Math.round(cropperState.cropper.y1 * ratio),
      x2: Math.round(cropperState.cropper.x2 * ratio),
      y2: Math.round(cropperState.cropper.y2 * ratio)
    };
    if (!cropperState.options?.containWithinAspectRatio) {
      out.x1 = Math.max(out.x1, 0);
      out.y1 = Math.max(out.y1, 0);
      out.x2 = Math.min(out.x2, cropperState.loadedImage.transformed.size.width);
      out.y2 = Math.min(out.y2, cropperState.loadedImage.transformed.size.height);
    }
    return out;
  }
  getOffsetImagePosition(input) {
    const canvasRotation = (input.options?.canvasRotation ?? 0) + input.loadedImage.exifTransform.rotate;
    const ratio = this.getRatio(input);
    let offsetX;
    let offsetY;
    if (canvasRotation % 2) {
      offsetX = (input.loadedImage.transformed.size.width - input.loadedImage.original.size.height) / 2;
      offsetY = (input.loadedImage.transformed.size.height - input.loadedImage.original.size.width) / 2;
    } else {
      offsetX = (input.loadedImage.transformed.size.width - input.loadedImage.original.size.width) / 2;
      offsetY = (input.loadedImage.transformed.size.height - input.loadedImage.original.size.height) / 2;
    }
    const cropper = input.cropper;
    const out = {
      x1: Math.round(cropper.x1 * ratio) - offsetX,
      y1: Math.round(cropper.y1 * ratio) - offsetY,
      x2: Math.round(cropper.x2 * ratio) - offsetX,
      y2: Math.round(cropper.y2 * ratio) - offsetY
    };
    if (!input.options?.containWithinAspectRatio) {
      out.x1 = Math.max(out.x1, 0);
      out.y1 = Math.max(out.y1, 0);
      out.x2 = Math.min(out.x2, input.loadedImage.transformed.size.width);
      out.y2 = Math.min(out.y2, input.loadedImage.transformed.size.height);
    }
    return out;
  }
  getResizeRatio(width, height, options) {
    const ratios = new Array();
    if (options?.resizeToWidth && options.resizeToWidth > 0) {
      ratios.push(options.resizeToWidth / width);
    }
    if (options?.resizeToHeight && options.resizeToHeight > 0) {
      ratios.push(options.resizeToHeight / height);
    }
    const result = ratios.length === 0 ? 1 : Math.min(...ratios);
    if (result > 1 && !options?.onlyScaleDown) {
      return result;
    }
    return Math.min(result, 1);
  }
  getQuality(options) {
    return Math.min(1, Math.max(0, (options?.imageQuality ?? 92) / 100));
  }
};
var testAutoOrientationImageByteArray = [new Uint8Array([255, 216, 255, 225, 0, 34, 69, 120, 105, 102, 0, 0, 77, 77, 0, 42, 0, 0, 0, 8, 0, 1, 1, 18, 0, 3, 0, 0, 0, 1, 0, 6, 0, 0, 0, 0, 0, 0, 255, 219, 0, 132, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 255, 192, 0, 17, 8, 0, 1, 0, 2, 3, 1, 17, 0, 2, 17, 1, 3, 17, 1, 255, 196, 0, 74, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 16, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 218, 0, 12, 3, 1, 0, 2, 17, 3, 17, 0, 63, 0, 63, 240, 127, 255, 217])];
var testAutoOrientationImageURL = URL.createObjectURL(new Blob(testAutoOrientationImageByteArray, {
  type: "image/jpeg"
}));
function supportsAutomaticRotation() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const supported = img.width === 1 && img.height === 2;
      resolve(supported);
    };
    img.src = testAutoOrientationImageURL;
  });
}
function getTransformationsFromExifData(exifRotationOrArrayBuffer) {
  if (typeof exifRotationOrArrayBuffer === "object") {
    exifRotationOrArrayBuffer = getExifRotation(exifRotationOrArrayBuffer);
  }
  switch (exifRotationOrArrayBuffer) {
    case 2:
      return {
        rotate: 0,
        flip: true
      };
    case 3:
      return {
        rotate: 2,
        flip: false
      };
    case 4:
      return {
        rotate: 2,
        flip: true
      };
    case 5:
      return {
        rotate: 1,
        flip: true
      };
    case 6:
      return {
        rotate: 1,
        flip: false
      };
    case 7:
      return {
        rotate: 3,
        flip: true
      };
    case 8:
      return {
        rotate: 3,
        flip: false
      };
    default:
      return {
        rotate: 0,
        flip: false
      };
  }
}
function getExifRotation(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.getUint16(0, false) !== 65496) {
    return -2;
  }
  const length = view.byteLength;
  let offset = 2;
  while (offset < length) {
    if (view.getUint16(offset + 2, false) <= 8) return -1;
    const marker = view.getUint16(offset, false);
    offset += 2;
    if (marker == 65505) {
      if (view.getUint32(offset += 2, false) !== 1165519206) {
        return -1;
      }
      const little = view.getUint16(offset += 6, false) == 18761;
      offset += view.getUint32(offset + 4, little);
      const tags = view.getUint16(offset, little);
      offset += 2;
      for (let i = 0; i < tags; i++) {
        if (view.getUint16(offset + i * 12, little) == 274) {
          return view.getUint16(offset + i * 12 + 8, little);
        }
      }
    } else if ((marker & 65280) !== 65280) {
      break;
    } else {
      offset += view.getUint16(offset, false);
    }
  }
  return -1;
}
var LoadImageService = class {
  constructor() {
    this.autoRotateSupported = supportsAutomaticRotation();
  }
  loadImageFile(file, options) {
    return __async(this, null, function* () {
      const arrayBuffer = yield file.arrayBuffer();
      if (options.checkImageType) {
        return yield this.checkImageTypeAndLoadImageFromArrayBuffer(arrayBuffer, file.type, options);
      }
      return yield this.loadImageFromArrayBuffer(arrayBuffer, options);
    });
  }
  checkImageTypeAndLoadImageFromArrayBuffer(arrayBuffer, imageType, options) {
    if (!this.isValidImageType(imageType)) {
      return Promise.reject(new Error("Invalid image type"));
    }
    return this.loadImageFromArrayBuffer(arrayBuffer, options, imageType);
  }
  isValidImageType(type) {
    return /image\/(png|jpg|jpeg|heic|bmp|gif|tiff|svg|webp|x-icon|vnd.microsoft.icon)/.test(type);
  }
  loadImageFromURL(url, options) {
    return __async(this, null, function* () {
      const res = yield fetch(url);
      const blob = yield res.blob();
      const buffer = yield blob.arrayBuffer();
      return yield this.loadImageFromArrayBuffer(buffer, options, blob.type);
    });
  }
  loadBase64Image(imageBase64, options) {
    const arrayBuffer = this.base64ToArrayBuffer(imageBase64);
    return this.loadImageFromArrayBuffer(arrayBuffer, options);
  }
  base64ToArrayBuffer(imageBase64) {
    imageBase64 = imageBase64.replace(/^data:([^;]+);base64,/gmi, "");
    const binaryString = atob(imageBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  loadImageFromArrayBuffer(arrayBuffer, options, imageType) {
    return __async(this, null, function* () {
      const res = yield new Promise((resolve, reject) => __async(this, null, function* () {
        try {
          const blob = new Blob([arrayBuffer], imageType ? {
            type: imageType
          } : void 0);
          const objectUrl = URL.createObjectURL(blob);
          const originalImage = new Image();
          const isSvg = imageType === "image/svg+xml";
          const originalImageSize = isSvg ? yield this.getSvgImageSize(blob) : void 0;
          originalImage.onload = () => resolve({
            originalImage,
            originalImageSize,
            originalObjectUrl: objectUrl,
            originalArrayBuffer: arrayBuffer
          });
          originalImage.onerror = reject;
          originalImage.src = objectUrl;
        } catch (e) {
          reject(e);
        }
      }));
      return yield this.transformImageFromArrayBuffer(res, options, res.originalImageSize != null);
    });
  }
  getSvgImageSize(blob) {
    return __async(this, null, function* () {
      const parser = new DOMParser();
      const doc = parser.parseFromString(yield blob.text(), "image/svg+xml");
      const svgElement = doc.querySelector("svg");
      if (!svgElement) {
        throw Error("Failed to parse SVG image");
      }
      const widthAttr = svgElement.getAttribute("width");
      const heightAttr = svgElement.getAttribute("height");
      if (widthAttr && heightAttr) {
        return null;
      }
      const viewBoxAttr = svgElement.getAttribute("viewBox") || svgElement.getAttribute("viewbox");
      if (viewBoxAttr) {
        const viewBox = viewBoxAttr.split(" ");
        return {
          width: +viewBox[2],
          height: +viewBox[3]
        };
      }
      throw Error("Failed to load SVG image. SVG must have width + height or viewBox definition.");
    });
  }
  transformImageFromArrayBuffer(res, options, forceTransform = false) {
    return __async(this, null, function* () {
      const autoRotate = yield this.autoRotateSupported;
      const exifTransform = getTransformationsFromExifData(autoRotate ? -1 : res.originalArrayBuffer);
      if (!res.originalImage || !res.originalImage.complete) {
        return Promise.reject(new Error("No image loaded"));
      }
      const loadedImage = {
        original: {
          objectUrl: res.originalObjectUrl,
          image: res.originalImage,
          size: res.originalImageSize ?? {
            width: res.originalImage.naturalWidth,
            height: res.originalImage.naturalHeight
          }
        },
        exifTransform
      };
      return this.transformLoadedImage(loadedImage, options, forceTransform);
    });
  }
  transformLoadedImage(loadedImage, options, forceTransform = false) {
    return __async(this, null, function* () {
      const canvasRotation = (options.canvasRotation ?? 0) + loadedImage.exifTransform.rotate;
      const originalSize = loadedImage.original.size;
      if (!forceTransform && canvasRotation === 0 && !loadedImage.exifTransform.flip && !options.containWithinAspectRatio) {
        return {
          original: {
            objectUrl: loadedImage.original.objectUrl,
            image: loadedImage.original.image,
            size: __spreadValues({}, originalSize)
          },
          transformed: {
            objectUrl: loadedImage.original.objectUrl,
            image: loadedImage.original.image,
            size: __spreadValues({}, originalSize)
          },
          exifTransform: loadedImage.exifTransform
        };
      }
      const transformedSize = this.getTransformedSize(originalSize, loadedImage.exifTransform, options);
      const canvas = document.createElement("canvas");
      canvas.width = transformedSize.width;
      canvas.height = transformedSize.height;
      const ctx = canvas.getContext("2d");
      ctx?.setTransform(loadedImage.exifTransform.flip ? -1 : 1, 0, 0, 1, canvas.width / 2, canvas.height / 2);
      ctx?.rotate(Math.PI * (canvasRotation / 2));
      ctx?.drawImage(loadedImage.original.image, -originalSize.width / 2, -originalSize.height / 2);
      const blob = yield new Promise((resolve) => canvas.toBlob(resolve, "image/" + (options.format ?? "png")));
      if (!blob) {
        throw new Error("Failed to get Blob for transformed image.");
      }
      const objectUrl = URL.createObjectURL(blob);
      const transformedImage = yield this.loadImageFromObjectUrl(objectUrl);
      return {
        original: {
          objectUrl: loadedImage.original.objectUrl,
          image: loadedImage.original.image,
          size: __spreadValues({}, originalSize)
        },
        transformed: {
          objectUrl,
          image: transformedImage,
          size: {
            width: transformedImage.width,
            height: transformedImage.height
          }
        },
        exifTransform: loadedImage.exifTransform
      };
    });
  }
  loadImageFromObjectUrl(objectUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = objectUrl;
    });
  }
  getTransformedSize(originalSize, exifTransform, options) {
    const canvasRotation = (options.canvasRotation ?? 0) + exifTransform.rotate;
    if (options.containWithinAspectRatio) {
      if (canvasRotation % 2) {
        const minWidthToContain = originalSize.width * (options.aspectRatio ?? 1);
        const minHeightToContain = originalSize.height / (options.aspectRatio ?? 1);
        return {
          width: Math.max(originalSize.height, minWidthToContain),
          height: Math.max(originalSize.width, minHeightToContain)
        };
      } else {
        const minWidthToContain = originalSize.height * (options.aspectRatio ?? 1);
        const minHeightToContain = originalSize.width / (options.aspectRatio ?? 1);
        return {
          width: Math.max(originalSize.width, minWidthToContain),
          height: Math.max(originalSize.height, minHeightToContain)
        };
      }
    }
    if (canvasRotation % 2) {
      return {
        height: originalSize.width,
        width: originalSize.height
      };
    }
    return {
      width: originalSize.width,
      height: originalSize.height
    };
  }
};
function getPositionForKey(key) {
  switch (key) {
    case "ArrowUp":
      return "top";
    case "ArrowRight":
      return "right";
    case "ArrowDown":
      return "bottom";
    case "ArrowLeft":
    default:
      return "left";
  }
}
function getInvertedPositionForKey(key) {
  switch (key) {
    case "ArrowUp":
      return "bottom";
    case "ArrowRight":
      return "left";
    case "ArrowDown":
      return "top";
    case "ArrowLeft":
    default:
      return "right";
  }
}
function getEventForKey(key, stepSize) {
  switch (key) {
    case "ArrowUp":
      return {
        clientX: 0,
        clientY: stepSize * -1
      };
    case "ArrowRight":
      return {
        clientX: stepSize,
        clientY: 0
      };
    case "ArrowDown":
      return {
        clientX: 0,
        clientY: stepSize
      };
    case "ArrowLeft":
    default:
      return {
        clientX: stepSize * -1,
        clientY: 0
      };
  }
}
var ImageCropperComponent = class _ImageCropperComponent {
  get alignImageStyle() {
    return this.state.options.alignImage;
  }
  constructor(sanitizer) {
    this.sanitizer = sanitizer;
    this.pinchStart$ = new Subject();
    this.cropService = new CropService();
    this.loadImageService = new LoadImageService();
    this.setImageMaxSizeRetries = 0;
    this.resizedWhileHidden = false;
    this.moveTypes = MoveTypes;
    this.state = new CropperState();
    this.safeImgDataUrl = signal(void 0);
    this.safeTransformStyle = signal(void 0);
    this.marginLeft = "0px";
    this.imageVisible = false;
    this.allowMoveImage = false;
    this.checkImageType = true;
    this.disabled = false;
    this.hidden = false;
    this.imageCropped = output();
    this.startCropImage = output();
    this.imageLoaded = output();
    this.cropperReady = output();
    this.loadImageFailed = output();
    this.transformChange = output();
    this.cropperChange = output();
    this.reset();
  }
  ngOnInit() {
    this.state.stepSize = this.initialStepSize || this.state.stepSize;
  }
  ngOnChanges(changes) {
    const previousCropperPosition = this.state.cropper();
    const previousTransform = this.state.transform;
    const previousBackgroundColor = this.state.options.backgroundColor;
    this.state.setOptionsFromChanges(changes);
    this.onChangesInputImage(changes);
    if (changes["transform"] && this.transform) {
      this.state.transform = this.transform;
      this.setCssTransform();
    }
    if (!this.state.loadedImage?.transformed.image.complete || !this.state.maxSize) {
      return;
    }
    if (this.containWithinAspectRatio && changes["aspectRatio"] || changes["containWithinAspectRatio"] || changes["canvasRotation"]) {
      this.loadImageService.transformLoadedImage(this.state.loadedImage, this.state.options).then((res) => this.setLoadedImage(res)).catch((err) => this.loadImageError(err));
      return;
    }
    if (changes["cropper"] && this.cropper) {
      this.state.cropper.set(checkCropperPosition(this.cropper, this.state, true));
    }
    const cropperChanged = !this.state.equalsCropperPosition(previousCropperPosition);
    if (cropperChanged && (!this.cropper || !this.state.equalsCropperPosition(this.cropper))) {
      this.cropperChange.emit(this.state.cropper());
    }
    if (cropperChanged || !this.state.equalsTransform(previousTransform) || this.state.options.backgroundColor !== previousBackgroundColor) {
      this.doAutoCrop();
    }
    if (changes["hidden"] && this.resizedWhileHidden && !this.hidden) {
      setTimeout(() => {
        this.onResize();
        this.resizedWhileHidden = false;
      });
    }
  }
  onChangesInputImage(changes) {
    if (changes["imageChangedEvent"] || changes["imageURL"] || changes["imageBase64"] || changes["imageFile"]) {
      this.reset();
    }
    if (changes["imageChangedEvent"] && this.isValidImageChangedEvent()) {
      this.loadImageFile(this.imageChangedEvent.target.files[0]);
    }
    if (changes["imageURL"] && this.imageURL) {
      this.loadImageFromURL(this.imageURL);
    }
    if (changes["imageBase64"] && this.imageBase64) {
      this.loadBase64Image(this.imageBase64);
    }
    if (changes["imageFile"] && this.imageFile) {
      this.loadImageFile(this.imageFile);
    }
  }
  isValidImageChangedEvent() {
    const files = this.imageChangedEvent?.target?.files;
    return files instanceof FileList && files.length > 0;
  }
  reset() {
    this.state.loadedImage = void 0;
    this.state.maxSize.set({
      width: 0,
      height: 0
    });
    this.imageVisible = false;
  }
  loadImageFile(file) {
    this.loadImageService.loadImageFile(file, this.state.options).then((res) => this.setLoadedImage(res)).catch((err) => this.loadImageError(err));
  }
  loadBase64Image(imageBase64) {
    this.loadImageService.loadBase64Image(imageBase64, this.state.options).then((res) => this.setLoadedImage(res)).catch((err) => this.loadImageError(err));
  }
  loadImageFromURL(url) {
    this.loadImageService.loadImageFromURL(url, this.state.options).then((res) => this.setLoadedImage(res)).catch((err) => this.loadImageError(err));
  }
  setLoadedImage(loadedImage) {
    this.state.loadedImage = loadedImage;
    this.safeImgDataUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(loadedImage.transformed.objectUrl));
  }
  loadImageError(error) {
    console.error(error);
    this.loadImageFailed.emit();
  }
  setCssTransform() {
    const translateUnit = this.state.transform?.translateUnit || "%";
    this.safeTransformStyle.set(this.sanitizer.bypassSecurityTrustStyle(`translate(${this.state.transform.translateH || 0}${translateUnit}, ${this.state.transform.translateV || 0}${translateUnit}) scaleX(` + (this.state.transform.scale || 1) * (this.state.transform.flipH ? -1 : 1) + ") scaleY(" + (this.state.transform.scale || 1) * (this.state.transform.flipV ? -1 : 1) + ") rotate(" + (this.state.transform.rotate || 0) + "deg)"));
  }
  imageLoadedInView() {
    if (this.state.loadedImage != null) {
      this.imageLoaded.emit(this.state.loadedImage);
      this.setImageMaxSizeRetries = 0;
      setTimeout(() => this.checkImageMaxSizeRecursively());
    }
  }
  checkImageMaxSizeRecursively() {
    if (this.setImageMaxSizeRetries > 40) {
      this.loadImageFailed.emit();
    } else if (this.sourceImageLoaded()) {
      this.setMaxSize();
      if (this.cropper && (!this.maintainAspectRatio || this.state.aspectRatioIsCorrect())) {
        this.state.cropper.set(checkCropperPosition(this.cropper, this.state, true));
        this.emitCropperPositionChange(this.cropper);
      } else {
        this.state.cropper.set(checkCropperPosition(this.state.maxSizeCropperPosition(), this.state, true));
        this.cropperChange.emit(this.state.cropper());
      }
      this.imageVisible = true;
      this.cropperReady.emit(this.state.maxSize());
      this.doAutoCrop();
    } else {
      this.setImageMaxSizeRetries++;
      setTimeout(() => this.checkImageMaxSizeRecursively(), 50);
    }
  }
  sourceImageLoaded() {
    return this.sourceImage?.nativeElement?.offsetWidth > 1;
  }
  onResize() {
    if (!this.state.loadedImage) {
      return;
    }
    if (this.hidden) {
      this.resizedWhileHidden = true;
    } else {
      const oldMaxSize = this.state.maxSize();
      this.setMaxSize();
      this.state.resizeCropperPosition(oldMaxSize);
    }
  }
  keyboardAccess(event) {
    this.changeKeyboardStepSize(event);
    this.keyboardMoveCropper(event);
  }
  changeKeyboardStepSize(event) {
    const key = +event.key;
    if (key >= 1 && key <= 9) {
      this.state.stepSize = key;
    }
  }
  keyboardMoveCropper(event) {
    const keyboardWhiteList = ["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"];
    if (!keyboardWhiteList.includes(event.key)) {
      return;
    }
    const moveType = event.shiftKey ? MoveTypes.Resize : MoveTypes.Move;
    const position = event.altKey ? getInvertedPositionForKey(event.key) : getPositionForKey(event.key);
    const moveEvent = getEventForKey(event.key, this.state.stepSize);
    event.preventDefault();
    event.stopPropagation();
    this.moveStart = {
      type: moveType,
      position,
      clientX: 0,
      clientY: 0,
      transform: this.state.transform,
      cropper: this.state.cropper()
    };
    this.handleMouseMove(moveEvent);
    this.handleMouseUp();
  }
  startMove(event, moveType, position = null) {
    if (this.disabled || this.moveStart && this.moveStart.type === MoveTypes.Pinch || moveType === MoveTypes.Drag && !this.allowMoveImage) {
      return;
    }
    if ("preventDefault" in event) {
      event.preventDefault();
    }
    this.moveStart = {
      type: moveType,
      position,
      clientX: getClientX(event),
      clientY: getClientY(event),
      transform: this.state.transform,
      cropper: this.state.cropper()
    };
    this.initMouseMove();
  }
  initMouseMove() {
    merge(fromEvent(document, "mousemove"), fromEvent(document, "touchmove")).pipe(takeUntil(merge(fromEvent(document, "mouseup"), fromEvent(document, "touchend"), this.pinchStart$).pipe(first()))).subscribe({
      next: (event) => this.handleMouseMove(event),
      complete: () => this.handleMouseUp()
    });
  }
  handleMouseMove(event) {
    if (!this.moveStart) {
      return;
    }
    if ("stopPropagation" in event) {
      event.stopPropagation();
    }
    if ("preventDefault" in event) {
      event.preventDefault();
    }
    if (this.moveStart.type === MoveTypes.Move) {
      this.state.cropper.set(checkCropperWithinMaxSizeBounds(moveCropper(event, this.moveStart), this.state, true));
    } else if (this.moveStart.type === MoveTypes.Resize) {
      if (!this.cropperStaticWidth && !this.cropperStaticHeight) {
        this.state.cropper.set(checkCropperWithinMaxSizeBounds(resizeCropper(event, this.moveStart, this.state), this.state, false));
      }
    } else if (this.moveStart.type === MoveTypes.Drag) {
      const diffX = getClientX(event) - this.moveStart.clientX;
      const diffY = getClientY(event) - this.moveStart.clientY;
      this.state.transform = __spreadProps(__spreadValues({}, this.state.transform), {
        translateH: (this.moveStart.transform?.translateH || 0) + diffX,
        translateV: (this.moveStart.transform?.translateV || 0) + diffY
      });
      this.setCssTransform();
    }
  }
  handleMouseUp() {
    if (!this.moveStart || this.moveStart.type === MoveTypes.Pinch) {
      return;
    }
    if (!this.state.equalsCropperPosition(this.moveStart.cropper) || this.moveStart.transform && !this.state.equalsTransform(this.moveStart.transform)) {
      if (this.moveStart.type === MoveTypes.Drag) {
        this.transformChange.emit(this.state.transform);
      } else {
        this.cropperChange.emit(this.state.cropper());
      }
      this.doAutoCrop();
    }
    this.moveStart = void 0;
  }
  startPinch(event) {
    if (this.disabled || !this.sourceImageLoaded() || event.touches.length < 2) {
      return;
    }
    if ("preventDefault" in event) {
      event.preventDefault();
    }
    const cropper = this.state.cropper();
    this.moveStart = {
      type: MoveTypes.Pinch,
      position: "center",
      clientX: cropper.x1 + (cropper.x2 - cropper.x1) / 2,
      clientY: cropper.y1 + (cropper.y2 - cropper.y1) / 2,
      cropper
    };
    this.initPinch();
  }
  initPinch() {
    this.pinchStart$.next();
    fromEvent(document, "touchmove").pipe(takeUntil(fromEvent(document, "touchend"))).subscribe({
      next: (event) => this.handlePinchMove(event),
      complete: () => this.handlePinchStop()
    });
  }
  handlePinchMove(event) {
    if (!this.moveStart) {
      return;
    }
    if (event.preventDefault) {
      event.preventDefault();
    }
    if (this.moveStart.type === MoveTypes.Pinch) {
      if (!this.cropperStaticWidth && !this.cropperStaticHeight) {
        this.state.cropper.set(checkCropperWithinMaxSizeBounds(resizeCropper(event, this.moveStart, this.state), this.state, false));
      }
    }
  }
  handlePinchStop() {
    if (!this.moveStart) {
      return;
    }
    if (!this.state.equalsCropperPosition(this.moveStart.cropper)) {
      this.emitCropperPositionChange(this.moveStart.cropper);
      this.doAutoCrop();
    }
    this.moveStart = void 0;
  }
  setMaxSize() {
    if (this.sourceImage) {
      const sourceImageStyle = getComputedStyle(this.sourceImage.nativeElement);
      this.state.setMaxSize(parseFloat(sourceImageStyle.width), parseFloat(sourceImageStyle.height));
      this.marginLeft = this.sanitizer.bypassSecurityTrustStyle("calc(50% - " + this.state.maxSize().width / 2 + "px)");
    }
  }
  emitCropperPositionChange(previousPosition) {
    if (!this.state.equalsCropperPosition(previousPosition)) {
      this.cropperChange.emit(this.state.cropper());
    }
  }
  doAutoCrop() {
    if (this.state.options.autoCrop) {
      void this.crop();
    }
  }
  crop(output2 = this.state.options.output) {
    if (this.state.loadedImage?.transformed?.image != null) {
      this.startCropImage.emit();
      if (output2 === "blob") {
        return this.cropToBlob();
      } else if (output2 === "base64") {
        return this.cropToBase64();
      }
    }
    return null;
  }
  cropToBlob() {
    return new Promise((resolve, reject) => __async(this, null, function* () {
      const result = yield this.cropService.crop(this.state.toCropInput(), "blob");
      if (result) {
        this.imageCropped.emit(result);
        resolve(result);
      } else {
        reject("Crop image failed");
      }
    }));
  }
  cropToBase64() {
    const result = this.cropService.crop(this.state.toCropInput(), "base64");
    if (result) {
      this.imageCropped.emit(result);
      return result;
    }
    return null;
  }
  resetCropperPosition() {
    this.state.cropper.set(checkCropperPosition(this.state.maxSizeCropperPosition(), this.state, true));
    this.cropperChange.emit(this.state.cropper());
  }
  ngOnDestroy() {
    this.pinchStart$.complete();
  }
  static {
    this.ɵfac = function ImageCropperComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ImageCropperComponent)(ɵɵdirectiveInject(DomSanitizer));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _ImageCropperComponent,
      selectors: [["image-cropper"]],
      viewQuery: function ImageCropperComponent_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(_c0, 7);
          ɵɵviewQuery(_c1, 5);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.wrapper = _t.first);
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.sourceImage = _t.first);
        }
      },
      hostVars: 6,
      hostBindings: function ImageCropperComponent_HostBindings(rf, ctx) {
        if (rf & 1) {
          ɵɵlistener("resize", function ImageCropperComponent_resize_HostBindingHandler() {
            return ctx.onResize();
          }, false, ɵɵresolveWindow);
        }
        if (rf & 2) {
          ɵɵstyleProp("text-align", ctx.alignImageStyle);
          ɵɵclassProp("disabled", ctx.disabled)("ngx-ic-hidden", ctx.hidden);
        }
      },
      inputs: {
        imageChangedEvent: "imageChangedEvent",
        imageURL: "imageURL",
        imageBase64: "imageBase64",
        imageFile: "imageFile",
        imageAltText: "imageAltText",
        options: "options",
        cropperFrameAriaLabel: "cropperFrameAriaLabel",
        output: "output",
        format: "format",
        autoCrop: "autoCrop",
        cropper: "cropper",
        transform: "transform",
        maintainAspectRatio: "maintainAspectRatio",
        aspectRatio: "aspectRatio",
        resetCropOnAspectRatioChange: "resetCropOnAspectRatioChange",
        resizeToWidth: "resizeToWidth",
        resizeToHeight: "resizeToHeight",
        cropperMinWidth: "cropperMinWidth",
        cropperMinHeight: "cropperMinHeight",
        cropperMaxHeight: "cropperMaxHeight",
        cropperMaxWidth: "cropperMaxWidth",
        cropperStaticWidth: "cropperStaticWidth",
        cropperStaticHeight: "cropperStaticHeight",
        canvasRotation: "canvasRotation",
        initialStepSize: "initialStepSize",
        roundCropper: "roundCropper",
        onlyScaleDown: "onlyScaleDown",
        imageQuality: "imageQuality",
        backgroundColor: "backgroundColor",
        containWithinAspectRatio: "containWithinAspectRatio",
        hideResizeSquares: "hideResizeSquares",
        allowMoveImage: "allowMoveImage",
        checkImageType: "checkImageType",
        alignImage: "alignImage",
        disabled: "disabled",
        hidden: "hidden"
      },
      outputs: {
        imageCropped: "imageCropped",
        startCropImage: "startCropImage",
        imageLoaded: "imageLoaded",
        cropperReady: "cropperReady",
        loadImageFailed: "loadImageFailed",
        transformChange: "transformChange",
        cropperChange: "cropperChange"
      },
      features: [ɵɵNgOnChangesFeature],
      decls: 4,
      vars: 10,
      consts: [["sourceImage", ""], [3, "touchstart"], ["class", "ngx-ic-source-image", "role", "presentation", 3, "src", "visibility", "transform", "ngx-ic-draggable", "load", "mousedown", "touchstart", "error", 4, "ngIf"], [1, "ngx-ic-overlay"], ["class", "ngx-ic-cropper", "tabindex", "0", 3, "ngx-ic-round", "top", "left", "width", "height", "margin-left", "visibility", "keydown", 4, "ngIf"], ["role", "presentation", 1, "ngx-ic-source-image", 3, "load", "mousedown", "touchstart", "error", "src"], ["tabindex", "0", 1, "ngx-ic-cropper", 3, "keydown"], ["role", "presentation", 1, "ngx-ic-move", 3, "mousedown", "touchstart"], [4, "ngIf"], ["role", "presentation", 1, "ngx-ic-resize", "ngx-ic-topleft", 3, "mousedown", "touchstart"], [1, "ngx-ic-square"], ["role", "presentation", 1, "ngx-ic-resize", "ngx-ic-topright", 3, "mousedown", "touchstart"], ["role", "presentation", 1, "ngx-ic-resize", "ngx-ic-bottomright", 3, "mousedown", "touchstart"], ["role", "presentation", 1, "ngx-ic-resize", "ngx-ic-bottomleft", 3, "mousedown", "touchstart"], ["role", "presentation", 1, "ngx-ic-resize-bar", "ngx-ic-top", 3, "mousedown", "touchstart"], [1, "ngx-ic-resize", "ngx-ic-top", 3, "mousedown", "touchstart"], ["role", "presentation", 1, "ngx-ic-resize-bar", "ngx-ic-right", 3, "mousedown", "touchstart"], [1, "ngx-ic-resize", "ngx-ic-right", 3, "mousedown", "touchstart"], ["role", "presentation", 1, "ngx-ic-resize-bar", "ngx-ic-bottom", 3, "mousedown", "touchstart"], [1, "ngx-ic-resize", "ngx-ic-bottom", 3, "mousedown", "touchstart"], ["role", "presentation", 1, "ngx-ic-resize-bar", "ngx-ic-left", 3, "mousedown", "touchstart"], [1, "ngx-ic-resize", "ngx-ic-left", 3, "mousedown", "touchstart"]],
      template: function ImageCropperComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵelementStart(0, "div", 1);
          ɵɵlistener("touchstart", function ImageCropperComponent_Template_div_touchstart_0_listener($event) {
            return ctx.startPinch($event);
          });
          ɵɵtemplate(1, ImageCropperComponent_img_1_Template, 2, 8, "img", 2);
          ɵɵelement(2, "div", 3);
          ɵɵtemplate(3, ImageCropperComponent_div_3_Template, 3, 16, "div", 4);
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵstyleProp("background", ctx.imageVisible && ctx.state.options.backgroundColor);
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.safeImgDataUrl());
          ɵɵadvance();
          ɵɵstyleProp("width", ctx.state.maxSize().width || 0, "px")("height", ctx.state.maxSize().height || 0, "px")("margin-left", ctx.state.options.alignImage === "center" ? ctx.marginLeft : null);
          ɵɵadvance();
          ɵɵproperty("ngIf", ctx.imageVisible);
        }
      },
      dependencies: [NgIf],
      styles: ['[_nghost-%COMP%]{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center}[_nghost-%COMP%] > div[_ngcontent-%COMP%]{width:100%;position:relative}[_nghost-%COMP%] > div[_ngcontent-%COMP%]   img.ngx-ic-source-image[_ngcontent-%COMP%]{display:inline;max-width:100%;max-height:100%;transform-origin:center}[_nghost-%COMP%] > div[_ngcontent-%COMP%]   img.ngx-ic-source-image.ngx-ic-draggable[_ngcontent-%COMP%]{user-drag:none;-webkit-user-drag:none;user-select:none;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;cursor:grab}[_nghost-%COMP%]   .ngx-ic-overlay[_ngcontent-%COMP%]{position:absolute;pointer-events:none;touch-action:none;outline:var(--cropper-overlay-color, white) solid 100vw;top:0;left:0}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]{position:absolute;display:flex;color:var(--cropper-color, #53535C);background:transparent;outline:var(--cropper-outline-color, rgba(255, 255, 255, .3)) solid 100vw;touch-action:none}@media (orientation: portrait){[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]{outline-width:100vh}}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]:after{position:absolute;content:"";inset:0;pointer-events:none;border:dashed 1px;opacity:.75;color:inherit;z-index:1}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-move[_ngcontent-%COMP%]{width:100%;cursor:move;border:var(--cropper-border, 1px solid rgba(255, 255, 255, .5))}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]:hover   .ngx-ic-move[_ngcontent-%COMP%]{border:var(--cropper-hover-border, var(--cropper-border, 1px solid rgba(255, 255, 255, .5)))}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]:focus   .ngx-ic-move[_ngcontent-%COMP%]{border:var(--cropper-focus-border, 2px solid dodgerblue)}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]:focus   .ngx-ic-resize[_ngcontent-%COMP%]   .ngx-ic-square[_ngcontent-%COMP%]{background:var(--cropper-resize-square-focus-bg, var(--cropper-resize-square-bg, #53535C));border:var(--cropper-resize-square-focus-border, var(--cropper-resize-square-border, 1px solid rgba(255, 255, 255, .5)))}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize[_ngcontent-%COMP%]{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize[_ngcontent-%COMP%]   .ngx-ic-square[_ngcontent-%COMP%]{display:inline-block;width:6px;height:6px;box-sizing:content-box;background:var(--cropper-resize-square-bg, #53535C);border:var(--cropper-resize-square-border, 1px solid rgba(255, 255, 255, .5))}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize[_ngcontent-%COMP%]:hover   .ngx-ic-square[_ngcontent-%COMP%]{background:var(--cropper-resize-square-hover-bg, var(--cropper-resize-square-bg, #53535C));border:var(--cropper-resize-square-hover-border, var(--cropper-resize-square-border, 1px solid rgba(255, 255, 255, .5)))}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-topleft[_ngcontent-%COMP%]{top:-12px;left:-12px;cursor:nwse-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-top[_ngcontent-%COMP%]{top:-12px;left:calc(50% - 12px);cursor:ns-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-topright[_ngcontent-%COMP%]{top:-12px;right:-12px;cursor:nesw-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-right[_ngcontent-%COMP%]{top:calc(50% - 12px);right:-12px;cursor:ew-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-bottomright[_ngcontent-%COMP%]{bottom:-12px;right:-12px;cursor:nwse-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-bottom[_ngcontent-%COMP%]{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-bottomleft[_ngcontent-%COMP%]{bottom:-12px;left:-12px;cursor:nesw-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize.ngx-ic-left[_ngcontent-%COMP%]{top:calc(50% - 12px);left:-12px;cursor:ew-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize-bar[_ngcontent-%COMP%]{position:absolute;z-index:1}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize-bar.ngx-ic-top[_ngcontent-%COMP%]{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize-bar.ngx-ic-right[_ngcontent-%COMP%]{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize-bar.ngx-ic-bottom[_ngcontent-%COMP%]{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize-bar.ngx-ic-left[_ngcontent-%COMP%]{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}[_nghost-%COMP%]   .ngx-ic-cropper.ngx-ic-round[_ngcontent-%COMP%]{outline-color:transparent}[_nghost-%COMP%]   .ngx-ic-cropper.ngx-ic-round[_ngcontent-%COMP%]:after{border-radius:100%;box-shadow:0 0 0 100vw var(--cropper-outline-color, rgba(255, 255, 255, .3))}@media (orientation: portrait){[_nghost-%COMP%]   .ngx-ic-cropper.ngx-ic-round[_ngcontent-%COMP%]:after{box-shadow:0 0 0 100vh var(--cropper-outline-color, rgba(255, 255, 255, .3))}}[_nghost-%COMP%]   .ngx-ic-cropper.ngx-ic-round[_ngcontent-%COMP%]   .ngx-ic-move[_ngcontent-%COMP%]{border-radius:100%}.disabled[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize[_ngcontent-%COMP%], .disabled[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-resize-bar[_ngcontent-%COMP%], .disabled[_nghost-%COMP%]   .ngx-ic-cropper[_ngcontent-%COMP%]   .ngx-ic-move[_ngcontent-%COMP%]{display:none}.ngx-ic-hidden[_nghost-%COMP%]{display:none}'],
      changeDetection: 0
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ImageCropperComponent, [{
    type: Component,
    args: [{
      selector: "image-cropper",
      changeDetection: ChangeDetectionStrategy.OnPush,
      standalone: true,
      imports: [NgIf],
      template: `<div
  [style.background]="imageVisible && state.options.backgroundColor"
  (touchstart)="startPinch($event)"
>
  <img
    #sourceImage
    class="ngx-ic-source-image"
    role="presentation"
    *ngIf="safeImgDataUrl() as src"
    [src]="src"
    [style.visibility]="imageVisible ? 'visible' : 'hidden'"
    [style.transform]="safeTransformStyle()"
    [class.ngx-ic-draggable]="!disabled && allowMoveImage"
    [attr.alt]="imageAltText"
    (load)="imageLoadedInView()"
    (mousedown)="startMove($event, moveTypes.Drag)"
    (touchstart)="startMove($event, moveTypes.Drag)"
    (error)="loadImageError($event)"
  >
  <div
    class="ngx-ic-overlay"
    [style.width.px]="state.maxSize().width || 0"
    [style.height.px]="state.maxSize().height || 0"
    [style.margin-left]="state.options.alignImage === 'center' ? marginLeft : null"
  ></div>
  <div
    class="ngx-ic-cropper"
    *ngIf="imageVisible"
    [class.ngx-ic-round]="state.options.roundCropper"
    [attr.aria-label]="state.options.cropperFrameAriaLabel"
    [style.top.px]="state.cropper().y1"
    [style.left.px]="state.cropper().x1"
    [style.width.px]="state.cropper().x2 - state.cropper().x1"
    [style.height.px]="state.cropper().y2 - state.cropper().y1"
    [style.margin-left]="state.options.alignImage === 'center' ? marginLeft : null"
    [style.visibility]="imageVisible ? 'visible' : 'hidden'"
    (keydown)="keyboardAccess($event)"
    tabindex="0"
  >
    <div
      (mousedown)="startMove($event, moveTypes.Move)"
      (touchstart)="startMove($event, moveTypes.Move)"
      class="ngx-ic-move"
      role="presentation">
    </div>
    <ng-container
      *ngIf="!state.options.hideResizeSquares && !(state.options.cropperStaticWidth && state.options.cropperStaticHeight)">
      <span
        class="ngx-ic-resize ngx-ic-topleft"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'topleft')"
        (touchstart)="startMove($event, moveTypes.Resize, 'topleft')"
      >
        <span class="ngx-ic-square"></span>
      </span>
      <span
        class="ngx-ic-resize ngx-ic-topright"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'topright')"
        (touchstart)="startMove($event, moveTypes.Resize, 'topright')"
      >
        <span class="ngx-ic-square"></span>
      </span>
      <span
        class="ngx-ic-resize ngx-ic-bottomright"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'bottomright')"
        (touchstart)="startMove($event, moveTypes.Resize, 'bottomright')"
      >
        <span class="ngx-ic-square"></span>
      </span>
      <span
        class="ngx-ic-resize ngx-ic-bottomleft"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'bottomleft')"
        (touchstart)="startMove($event, moveTypes.Resize, 'bottomleft')"
      >
        <span class="ngx-ic-square"></span>
      </span>
      <span
        class="ngx-ic-resize-bar ngx-ic-top"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'top')"
        (touchstart)="startMove($event, moveTypes.Resize, 'top')"
      ></span>

      <span
        class="ngx-ic-resize ngx-ic-top"
        (mousedown)="startMove($event, moveTypes.Resize, 'top')"
        (touchstart)="startMove($event, moveTypes.Resize, 'top')"
      >
        <span class="ngx-ic-square"></span>
      </span>
      <span
        class="ngx-ic-resize-bar ngx-ic-right"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'right')"
        (touchstart)="startMove($event, moveTypes.Resize, 'right')"
      ></span>
      <span
        class="ngx-ic-resize ngx-ic-right"
        (mousedown)="startMove($event, moveTypes.Resize, 'right')"
        (touchstart)="startMove($event, moveTypes.Resize, 'right')"
      >
        <span class="ngx-ic-square"></span>
      </span>
      <span
        class="ngx-ic-resize-bar ngx-ic-bottom"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'bottom')"
        (touchstart)="startMove($event, moveTypes.Resize, 'bottom')"
      ></span>
      <span
        class="ngx-ic-resize ngx-ic-bottom"
        (mousedown)="startMove($event, moveTypes.Resize, 'bottom')"
        (touchstart)="startMove($event, moveTypes.Resize, 'bottom')"
      >
        <span class="ngx-ic-square"></span>
      </span>
      <span
        class="ngx-ic-resize-bar ngx-ic-left"
        role="presentation"
        (mousedown)="startMove($event, moveTypes.Resize, 'left')"
        (touchstart)="startMove($event, moveTypes.Resize, 'left')"
      ></span>
      <span
        class="ngx-ic-resize ngx-ic-left"
        (mousedown)="startMove($event, moveTypes.Resize, 'left')"
        (touchstart)="startMove($event, moveTypes.Resize, 'left')"
      >
        <span class="ngx-ic-square"></span>
      </span>
    </ng-container>
  </div>
</div>
`,
      styles: [':host{display:flex;position:relative;width:100%;max-width:100%;max-height:100%;overflow:hidden;padding:5px;text-align:center}:host>div{width:100%;position:relative}:host>div img.ngx-ic-source-image{display:inline;max-width:100%;max-height:100%;transform-origin:center}:host>div img.ngx-ic-source-image.ngx-ic-draggable{user-drag:none;-webkit-user-drag:none;user-select:none;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;cursor:grab}:host .ngx-ic-overlay{position:absolute;pointer-events:none;touch-action:none;outline:var(--cropper-overlay-color, white) solid 100vw;top:0;left:0}:host .ngx-ic-cropper{position:absolute;display:flex;color:var(--cropper-color, #53535C);background:transparent;outline:var(--cropper-outline-color, rgba(255, 255, 255, .3)) solid 100vw;touch-action:none}@media (orientation: portrait){:host .ngx-ic-cropper{outline-width:100vh}}:host .ngx-ic-cropper:after{position:absolute;content:"";inset:0;pointer-events:none;border:dashed 1px;opacity:.75;color:inherit;z-index:1}:host .ngx-ic-cropper .ngx-ic-move{width:100%;cursor:move;border:var(--cropper-border, 1px solid rgba(255, 255, 255, .5))}:host .ngx-ic-cropper:hover .ngx-ic-move{border:var(--cropper-hover-border, var(--cropper-border, 1px solid rgba(255, 255, 255, .5)))}:host .ngx-ic-cropper:focus .ngx-ic-move{border:var(--cropper-focus-border, 2px solid dodgerblue)}:host .ngx-ic-cropper:focus .ngx-ic-resize .ngx-ic-square{background:var(--cropper-resize-square-focus-bg, var(--cropper-resize-square-bg, #53535C));border:var(--cropper-resize-square-focus-border, var(--cropper-resize-square-border, 1px solid rgba(255, 255, 255, .5)))}:host .ngx-ic-cropper .ngx-ic-resize{position:absolute;display:inline-block;line-height:6px;padding:8px;opacity:.85;z-index:1}:host .ngx-ic-cropper .ngx-ic-resize .ngx-ic-square{display:inline-block;width:6px;height:6px;box-sizing:content-box;background:var(--cropper-resize-square-bg, #53535C);border:var(--cropper-resize-square-border, 1px solid rgba(255, 255, 255, .5))}:host .ngx-ic-cropper .ngx-ic-resize:hover .ngx-ic-square{background:var(--cropper-resize-square-hover-bg, var(--cropper-resize-square-bg, #53535C));border:var(--cropper-resize-square-hover-border, var(--cropper-resize-square-border, 1px solid rgba(255, 255, 255, .5)))}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-topleft{top:-12px;left:-12px;cursor:nwse-resize}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-top{top:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-topright{top:-12px;right:-12px;cursor:nesw-resize}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-right{top:calc(50% - 12px);right:-12px;cursor:ew-resize}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-bottomright{bottom:-12px;right:-12px;cursor:nwse-resize}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-bottom{bottom:-12px;left:calc(50% - 12px);cursor:ns-resize}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-bottomleft{bottom:-12px;left:-12px;cursor:nesw-resize}:host .ngx-ic-cropper .ngx-ic-resize.ngx-ic-left{top:calc(50% - 12px);left:-12px;cursor:ew-resize}:host .ngx-ic-cropper .ngx-ic-resize-bar{position:absolute;z-index:1}:host .ngx-ic-cropper .ngx-ic-resize-bar.ngx-ic-top{top:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .ngx-ic-cropper .ngx-ic-resize-bar.ngx-ic-right{top:11px;right:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .ngx-ic-cropper .ngx-ic-resize-bar.ngx-ic-bottom{bottom:-11px;left:11px;width:calc(100% - 22px);height:22px;cursor:ns-resize}:host .ngx-ic-cropper .ngx-ic-resize-bar.ngx-ic-left{top:11px;left:-11px;height:calc(100% - 22px);width:22px;cursor:ew-resize}:host .ngx-ic-cropper.ngx-ic-round{outline-color:transparent}:host .ngx-ic-cropper.ngx-ic-round:after{border-radius:100%;box-shadow:0 0 0 100vw var(--cropper-outline-color, rgba(255, 255, 255, .3))}@media (orientation: portrait){:host .ngx-ic-cropper.ngx-ic-round:after{box-shadow:0 0 0 100vh var(--cropper-outline-color, rgba(255, 255, 255, .3))}}:host .ngx-ic-cropper.ngx-ic-round .ngx-ic-move{border-radius:100%}:host.disabled .ngx-ic-cropper .ngx-ic-resize,:host.disabled .ngx-ic-cropper .ngx-ic-resize-bar,:host.disabled .ngx-ic-cropper .ngx-ic-move{display:none}:host.ngx-ic-hidden{display:none}\n']
    }]
  }], () => [{
    type: DomSanitizer
  }], {
    wrapper: [{
      type: ViewChild,
      args: ["wrapper", {
        static: true
      }]
    }],
    sourceImage: [{
      type: ViewChild,
      args: ["sourceImage", {
        static: false
      }]
    }],
    imageChangedEvent: [{
      type: Input
    }],
    imageURL: [{
      type: Input
    }],
    imageBase64: [{
      type: Input
    }],
    imageFile: [{
      type: Input
    }],
    imageAltText: [{
      type: Input
    }],
    options: [{
      type: Input
    }],
    cropperFrameAriaLabel: [{
      type: Input
    }],
    output: [{
      type: Input
    }],
    format: [{
      type: Input
    }],
    autoCrop: [{
      type: Input
    }],
    cropper: [{
      type: Input
    }],
    transform: [{
      type: Input
    }],
    maintainAspectRatio: [{
      type: Input
    }],
    aspectRatio: [{
      type: Input
    }],
    resetCropOnAspectRatioChange: [{
      type: Input
    }],
    resizeToWidth: [{
      type: Input
    }],
    resizeToHeight: [{
      type: Input
    }],
    cropperMinWidth: [{
      type: Input
    }],
    cropperMinHeight: [{
      type: Input
    }],
    cropperMaxHeight: [{
      type: Input
    }],
    cropperMaxWidth: [{
      type: Input
    }],
    cropperStaticWidth: [{
      type: Input
    }],
    cropperStaticHeight: [{
      type: Input
    }],
    canvasRotation: [{
      type: Input
    }],
    initialStepSize: [{
      type: Input
    }],
    roundCropper: [{
      type: Input
    }],
    onlyScaleDown: [{
      type: Input
    }],
    imageQuality: [{
      type: Input
    }],
    backgroundColor: [{
      type: Input
    }],
    containWithinAspectRatio: [{
      type: Input
    }],
    hideResizeSquares: [{
      type: Input
    }],
    allowMoveImage: [{
      type: Input
    }],
    checkImageType: [{
      type: Input
    }],
    alignImage: [{
      type: Input
    }],
    disabled: [{
      type: HostBinding,
      args: ["class.disabled"]
    }, {
      type: Input
    }],
    hidden: [{
      type: HostBinding,
      args: ["class.ngx-ic-hidden"]
    }, {
      type: Input
    }],
    alignImageStyle: [{
      type: HostBinding,
      args: ["style.text-align"]
    }],
    onResize: [{
      type: HostListener,
      args: ["window:resize"]
    }]
  });
})();
function base64ToFile(base64Image) {
  const split = base64Image.split(",");
  const type = split[0].replace("data:", "").replace(";base64", "");
  const byteString = atob(split[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {
    type
  });
}
export {
  CropService,
  ImageCropperComponent,
  LoadImageService,
  base64ToFile,
  resizeCanvas
};
//# sourceMappingURL=ngx-image-cropper.js.map
