import { COLORS } from './constants';
import { createLayoutFromString } from './utils';

export function injectStyles(): void {
  document.head.append(createLayoutFromString(`
    <style>
      .mf-nofication {
        opacity: 0;
        pointer-events: none;
        position: absolute;
      }

      .mf-save-snippet-btn {
        position: absolute;
        right: 50px;
        bottom: 16px;
        height: 24px;
        background: ${COLORS.PRIMARY};
        border-radius: 6px;
        width: 24px;
        padding: 3px;
        transition: background .2s;
      }

      .mf-save-snippet-btn:hover {
        cursor: pointer;
        background: rgb(91 101 224);
        transition: background .2s;
      }

      .mf-snippets {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 8px;
        max-height: 90px;
        overflow: auto;
      }

      .mf-snippet {
        position: relative;
        overflow: hidden;
        background: ${COLORS.PRIMARY};
        border-radius: 6px;
        padding-right: 20px;
        display: flex;
      }

      .mf-snippet__append-action {
        background: ${COLORS.APPEND_ACTION_FEATURE};
      }

      .mf-snippet__label {
        font-size: 11px;
        max-width: 220px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 3px 5px;
      }

      .mf-snippet__label:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, .1);
        transition: background .2s;
      }

      .mf-snippet__remove {
        position: absolute;
        right: 0;
        font-size: 18px;
        line-height: inherit;
        height: 100%;
        top: 0;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 0;
      }

      .mf-snippet__remove::before {
        content: '';
        position: absolute;
        left: -1px;
        background: rgba(255,255,255,.3);
        height: 100%;
        width: 1px;
      }

      .mf-snippet__remove:hover {
        cursor: pointer;
        background: rgba(255, 255, 255, .1);
        transition: background .2s;
      }

      .mf-snippet-form-popup {
        position: absolute;
        bottom: 6px;
        right: 74px;
        padding-right: 8px;
        width: 200px;
        height: 44px;
        transition: opacity .15s;
        color: #000;
        opacity: 0;
        pointer-events: none;
      }

      .mf-snippet-form-popup__form {
        background: #fff;
        border-radius: 6px;
        height: 100%;
        overflow: hidden;
        position: relative;
      }

      .mf-snippet-form-popup-arrow {
        position: absolute;
        width: 0;
        height: 0;
        margin-left: 0;
        bottom: 0;
        top: calc(50% - 5px);
        right: 3px;
        box-sizing: border-box;
        border: 5px solid #fff;
        border-color: #fff #fff transparent transparent;
        transform-origin: 5px 5px;
        transform: rotate(45deg);
      }

      .mf-snippet-form-popup-steps {
        height: 100%;
        transition: transform .2s;
      }

      .mf-snippet-form-popup-steps__item {
        height: 100%;
        overflow: hidden;
      }

      .mf-snippet-form-popup-steps__item-title {
        position: absolute;
        left: 8px;
        font-size: 11px;
        pointer-events: none;
      }

      .mf-snippet-form-label-step__input {
        width: 100%;
        padding: 10px;
        background: transparent;
        height: 100%;
        font-size: 14px;
        color: #000;
        border: 0;
      }

      .mf-new-snippet-popup-action-type-step {
        position: relative;
      }

      .mf-new-snippet-popup-action-type-step__content {
        padding: 14px 10px 0 10px;
        height: 100%;
      }

      .mf-radio {
        font-size: 12px;
        display: flex;
        line-height: 14px;
        padding-left: 18px;
        position: relative;
      }

      .mf-radio input {
        position: absolute;
        opacity: 0;
        top: -2px;
      }

      .mf-radio input:checked + .mf-radio__circle .mf-radio__dot {
        background: ${COLORS.PRIMARY};
      }

      .mf-radio input:focus + .mf-radio__circle {
        box-shadow: 0 0 0 2px rgba(0,123,255,0.5);
      }

      .mf-radio__circle {
        position: absolute;
        width: 12px;
        height: 12px;
        left: 0;
        top: 1px;
        border: 1px solid ${COLORS.PRIMARY};
        border-radius: 50%;
        padding: 2px;
        transition: border-color .2s;
      }

      .mf-radio__dot {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: transparent;
        transition: background .2s;
      }

      .mf-radio.mf-action-type-append-radio input:checked + .mf-radio__circle {
        border-color: ${COLORS.APPEND_ACTION_FEATURE};
      }

      .mf-radio.mf-action-type-append-radio input:checked + .mf-radio__circle .mf-radio__dot {
        background: ${COLORS.APPEND_ACTION_FEATURE};
      }
    </style>
  `));
}
