import { PixelRatio } from "react-native";

export type DialogBubbleMode =
    | "small"
    | "medium"
    | "large"
    | "avatar"
    | "zip"
    | "dark"
    | "explanation";

type PaginationOptions = {
    text: string;
    mode?: DialogBubbleMode;

    screenWidth: number;

    isTablet: boolean;
    isSmallScreen: boolean;

    maxLines?: number;

    /**
     * Минимальное желательное количество слов
     * на последней странице.
     */
    minLastPageWords?: number;
};

type TextMetrics = {
    textWidth: number;
    fontSize: number;
};

const SENTENCE_END_PATTERN =
    /[.!?…]["'»”)\]]?$/u;

const normalizeText = (text: string) =>
    text
        .replace(/[ \t]+/g, " ")
        .replace(/\s*\n+\s*/g, " ")
        .trim();

/**
 * Эти значения должны соответствовать размерам
 * текста и контейнеров в SpeechBubble.
 */
const getTextMetrics = ({
                            mode,
                            screenWidth,
                            isTablet,
                            isSmallScreen,
                        }: {
    mode: DialogBubbleMode;
    screenWidth: number;
    isTablet: boolean;
    isSmallScreen: boolean;
}): TextMetrics => {
    switch (mode) {
        case "small":
            return {
                textWidth:
                    screenWidth * 0.38 -
                    (isTablet ? 35 : 30),

                fontSize:
                    isTablet ? 24 : 13,
            };

        case "medium":
            return {
                textWidth:
                    screenWidth * 0.48 -
                    (isTablet ? 35 : 30),

                fontSize:
                    isTablet ? 24 : 13,
            };

        case "large":
            return {
                textWidth:
                    screenWidth * 0.58 -
                    (isTablet ? 35 : 30),

                fontSize:
                    isTablet ? 24 : 13,
            };

        case "avatar":
            return {
                textWidth:
                    screenWidth * 0.75 -
                    screenWidth * 0.102,

                fontSize:
                    screenWidth * 0.031,
            };

        case "zip": {
            const bubbleWidth = isTablet
                ? Math.min(screenWidth * 0.62, 560)
                : Math.min(screenWidth * 0.78, 420);

            return {
                textWidth:
                    bubbleWidth -
                    (isTablet ? 44 : 30),

                fontSize: isTablet
                    ? 18
                    : isSmallScreen
                        ? 12
                        : 15,
            };
        }

        case "dark": {
            const bubbleWidth = Math.min(
                screenWidth * 0.52,
                isTablet ? 360 : 280
            );

            return {
                textWidth:
                    bubbleWidth -
                    screenWidth * 0.07,

                fontSize: isTablet
                    ? 20
                    : isSmallScreen
                        ? 12
                        : 14,
            };
        }

        case "explanation": {
            const bubbleWidth = isTablet
                ? Math.min(screenWidth * 0.82, 620)
                : Math.min(screenWidth * 0.88, 460);

            return {
                textWidth:
                    bubbleWidth -
                    (isTablet ? 44 : 28),

                fontSize: isTablet
                    ? 17
                    : isSmallScreen
                        ? 11
                        : 14,
            };
        }

        default:
            return {
                textWidth: screenWidth * 0.48 - 30,
                fontSize: 13,
            };
    }
};

/**
 * Считает количество строк так же, как происходит
 * обычный перенос текста по словам.
 *
 * IBM Plex Mono — моноширинный шрифт, поэтому такой
 * расчёт значительно точнее обычного лимита символов.
 */
const countWrappedLines = (
    words: string[],
    charactersPerLine: number
): number => {
    if (words.length === 0) {
        return 0;
    }

    let lines = 1;
    let currentLineLength = 0;

    for (const word of words) {
        const wordLength = word.length;

        if (currentLineLength === 0) {
            if (wordLength <= charactersPerLine) {
                currentLineLength = wordLength;
                continue;
            }

            /*
             * На случай очень длинного слова без пробелов.
             */
            const fullLines = Math.floor(
                wordLength / charactersPerLine
            );

            lines += fullLines;

            currentLineLength =
                wordLength % charactersPerLine;

            if (currentLineLength === 0) {
                lines -= 1;
                currentLineLength =
                    charactersPerLine;
            }

            continue;
        }

        const lengthWithSpace =
            currentLineLength + 1 + wordLength;

        if (lengthWithSpace <= charactersPerLine) {
            currentLineLength = lengthWithSpace;
            continue;
        }

        lines += 1;

        if (wordLength <= charactersPerLine) {
            currentLineLength = wordLength;
        } else {
            const fullLines = Math.floor(
                wordLength / charactersPerLine
            );

            lines += fullLines;

            currentLineLength =
                wordLength % charactersPerLine;

            if (currentLineLength === 0) {
                lines -= 1;
                currentLineLength =
                    charactersPerLine;
            }
        }
    }

    return lines;
};

const fitsIntoPage = (
    words: string[],
    charactersPerLine: number,
    maxLines: number
) =>
    countWrappedLines(
        words,
        charactersPerLine
    ) <= maxLines;

/**
 * Если внутри заполненной страницы есть естественный
 * конец предложения около конца страницы, переносим
 * следующий текст на новую страницу.
 *
 * Но не создаём отдельное окно для каждого предложения.
 */
const findNaturalCutIndex = (
    words: string[]
): number => {
    if (words.length < 5) {
        return -1;
    }

    /*
     * Ищем конец предложения только во второй половине
     * уже заполненной страницы.
     */
    const minimumIndex = Math.floor(
        words.length * 0.58
    );

    for (
        let index = words.length - 2;
        index >= minimumIndex;
        index -= 1
    ) {
        if (
            SENTENCE_END_PATTERN.test(
                words[index]
            )
        ) {
            return index;
        }
    }

    return -1;
};

const rebalanceLastPage = ({
                               pages,
                               charactersPerLine,
                               maxLines,
                               minLastPageWords,
                           }: {
    pages: string[][];
    charactersPerLine: number;
    maxLines: number;
    minLastPageWords: number;
}) => {
    if (pages.length < 2) {
        return;
    }

    const lastPage =
        pages[pages.length - 1];

    const previousPage =
        pages[pages.length - 2];

    /*
     * Не оставляем на последней странице одно-два слова.
     * Переносим несколько последних слов с предыдущей.
     */
    while (
        lastPage.length < minLastPageWords &&
        previousPage.length > minLastPageWords
        ) {
        const wordToMove =
            previousPage[previousPage.length - 1];

        const candidateLastPage = [
            wordToMove,
            ...lastPage,
        ];

        if (
            !fitsIntoPage(
                candidateLastPage,
                charactersPerLine,
                maxLines
            )
        ) {
            break;
        }

        previousPage.pop();
        lastPage.unshift(wordToMove);
    }
};

export const paginateDialogText = ({
                                       text,
                                       mode = "medium",
                                       screenWidth,
                                       isTablet,
                                       isSmallScreen,
                                       maxLines = 3,
                                       minLastPageWords = 4,
                                   }: PaginationOptions): string[] => {
    const normalizedText =
        normalizeText(text);

    if (!normalizedText) {
        return [""];
    }

    const {
        textWidth,
        fontSize,
    } = getTextMetrics({
        mode,
        screenWidth,
        isTablet,
        isSmallScreen,
    });

    /*
     * Если системное масштабирование шрифта включено,
     * учитываем его при расчёте.
     */
    const fontScale =
        PixelRatio.getFontScale();

    const renderedFontSize =
        fontSize * fontScale;

    /*
     * IBM Plex Mono: ширина символа примерно 0.6 em.
     * Небольшой запас нужен из-за разницы рендера
     * между Android, iOS и Web.
     */
    const averageCharacterWidth =
        renderedFontSize * 0.62;

    const charactersPerLine = Math.max(
        10,
        Math.floor(
            textWidth /
            averageCharacterWidth
        )
    );

    const words = normalizedText
        .split(" ")
        .filter(Boolean);

    /*
     * Если весь текст уже помещается —
     * ничего не делим.
     */
    if (
        fitsIntoPage(
            words,
            charactersPerLine,
            maxLines
        )
    ) {
        return [normalizedText];
    }

    const remainingWords = [...words];
    const pages: string[][] = [];

    while (remainingWords.length > 0) {
        const currentPage: string[] = [];

        while (remainingWords.length > 0) {
            const nextWord =
                remainingWords[0];

            const candidate = [
                ...currentPage,
                nextWord,
            ];

            if (
                fitsIntoPage(
                    candidate,
                    charactersPerLine,
                    maxLines
                )
            ) {
                currentPage.push(
                    remainingWords.shift() as string
                );

                continue;
            }

            break;
        }

        /*
         * Защита от очень длинного одиночного слова.
         */
        if (currentPage.length === 0) {
            currentPage.push(
                remainingWords.shift() as string
            );
        }

        /*
         * Стараемся закончить страницу на точке,
         * но только если точка находится ближе к концу.
         */
        const naturalCutIndex =
            findNaturalCutIndex(currentPage);

        if (
            naturalCutIndex >= 0 &&
            naturalCutIndex <
            currentPage.length - 1
        ) {
            const wordsAfterSentence =
                currentPage.splice(
                    naturalCutIndex + 1
                );

            remainingWords.unshift(
                ...wordsAfterSentence
            );
        }

        pages.push(currentPage);
    }

    rebalanceLastPage({
        pages,
        charactersPerLine,
        maxLines,
        minLastPageWords,
    });

    return pages.map((page) =>
        page.join(" ")
    );
};

type TextFitOptions = {
    text: string;
    mode: DialogBubbleMode;

    screenWidth: number;
    isTablet: boolean;
    isSmallScreen: boolean;

    maxLines?: number;
};

export const doesTextFitBubble = ({
      text,
      mode,
      screenWidth,
      isTablet,
      isSmallScreen,
      maxLines = 3,
  }: TextFitOptions): boolean => {
    const normalizedText = normalizeText(text);

    if (!normalizedText) {
        return true;
    }

    const {
        textWidth,
        fontSize,
    } = getTextMetrics({
        mode,
        screenWidth,
        isTablet,
        isSmallScreen,
    });

    const fontScale = PixelRatio.getFontScale();

    const renderedFontSize =
        fontSize * fontScale;

    const averageCharacterWidth =
        renderedFontSize * 0.62;

    const charactersPerLine = Math.max(
        10,
        Math.floor(
            textWidth / averageCharacterWidth
        )
    );

    const words = normalizedText
        .split(" ")
        .filter(Boolean);

    return fitsIntoPage(
        words,
        charactersPerLine,
        maxLines
    );
};