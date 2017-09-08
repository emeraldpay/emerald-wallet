// @flow

export class Currency {
    static format(value: number, currency: string): string {
        const formatter = new Intl.NumberFormat(Currency.locale(currency), {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        });
        return formatter.format(value);
    }

    static locale(currencySymbol: string): string {
        switch (currencySymbol.toUpperCase()) {
            case 'RUB': return 'ru-RU';
            case 'USD': return 'en-US';
            case 'EUR': return 'de-DE';
            case 'CNY': return 'zh-CN';
            default: return 'en-US';
        }
    }
}
