/**
 * @link https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/Snackbar/Snackbar.js
 */
import * as React from 'react';
import clsx from 'clsx';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { REASONS } from '../utils/constants';
import useEventCallback from '../utils/useEventCallback';
import { SharedProps } from '../index';
import { ComponentClasses } from '../utils/styles';

interface SnackbarProps extends Required<Pick<SharedProps, | 'disableWindowBlurListener' | 'onClose'>> {
    open: boolean;
    className: string;
    children: JSX.Element;
    autoHideDuration: number | null | undefined;
    SnackbarProps: SharedProps['SnackbarProps'];
}

const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>((props, ref) => {
    const {
        children,
        className,
        autoHideDuration,
        disableWindowBlurListener = false,
        onClose,
        open,
        SnackbarProps = {}
    } = props;

    const timerAutoHide = React.useRef<ReturnType<typeof setTimeout>>();

    const handleClose = useEventCallback((...args: any[]) => {
        // @ts-ignore
        if (onClose) onClose(...args);
    });

    const setAutoHideTimer = useEventCallback((autoHideDurationParam: number | null) => {
        if (!onClose || autoHideDurationParam == null) {
            return;
        }

        if (timerAutoHide.current) {
            clearTimeout(timerAutoHide.current);
        }
        timerAutoHide.current = setTimeout(() => {
            handleClose(null, REASONS.TIMEOUT);
        }, autoHideDurationParam);
    });

    React.useEffect(() => {
        if (open) {
            setAutoHideTimer(autoHideDuration);
        }

        return () => {
            if (timerAutoHide.current) {
                clearTimeout(timerAutoHide.current);
            }
        };
    }, [open, autoHideDuration, setAutoHideTimer]);

    /**
     * Pause the timer when the user is interacting with the Snackbar
     * or when the user hide the window.
     */
    const handlePause = () => {
        if (timerAutoHide.current) {
            clearTimeout(timerAutoHide.current);
        }
    };

    /**
     * Restart the timer when the user is no longer interacting with the Snackbar
     * or when the window is shown back.
     */
    const handleResume = React.useCallback(() => {
        if (autoHideDuration != null) {
            setAutoHideTimer(autoHideDuration * 0.5);
        }
    }, [autoHideDuration, setAutoHideTimer]);

    const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (SnackbarProps.onMouseEnter) {
            SnackbarProps.onMouseEnter(event);
        }
        handlePause();
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = (event) => {
        if (SnackbarProps.onMouseLeave) {
            SnackbarProps.onMouseLeave(event);
        }
        handleResume();
    };

    const handleClickAway = (event: React.MouseEvent<Document>) => {
        if (onClose) {
            onClose(event, REASONS.CLICKAWAY);
        }
    };

    React.useEffect(() => {
        if (!disableWindowBlurListener && open) {
            window.addEventListener('focus', handleResume);
            window.addEventListener('blur', handlePause);

            return () => {
                window.removeEventListener('focus', handleResume);
                window.removeEventListener('blur', handlePause);
            };
        }

        return undefined;
    }, [disableWindowBlurListener, handleResume, open]);

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <div ref={ref} {...SnackbarProps} className={clsx(ComponentClasses.Snackbar, className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {children}
            </div>
        </ClickAwayListener>
    );
});

export default Snackbar;
