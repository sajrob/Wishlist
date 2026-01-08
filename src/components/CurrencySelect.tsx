import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Currency {
    code: string;
    name: string;
    symbol: string;
}

export const CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
    { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ.' },
    { code: 'AFN', name: 'Afghan Afghani', symbol: '؋' },
    { code: 'ALL', name: 'Albanian Lek', symbol: 'Lek' },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏' },
    { code: 'ANG', name: 'Netherlands Antillean Guilder', symbol: 'ƒ' },
    { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz' },
    { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
    { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ' },
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼' },
    { code: 'BAM', name: 'Bosnia and Herzegovina Convertible Mark', symbol: 'KM' },
    { code: 'BBD', name: 'Barbadian Dollar', symbol: '$' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
    { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب' },
    { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu' },
    { code: 'BMD', name: 'Bermudian Dollar', symbol: '$' },
    { code: 'BND', name: 'Brunei Dollar', symbol: 'B$' },
    { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'BSD', name: 'Bahamian Dollar', symbol: '$' },
    { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.' },
    { code: 'BWP', name: 'Botswana Pula', symbol: 'P' },
    { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br' },
    { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$' },
    { code: 'CDF', name: 'Congolese Franc', symbol: 'FC' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
    { code: 'COP', name: 'Colombian Peso', symbol: '$' },
    { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
    { code: 'CUP', name: 'Cuban Peso', symbol: '₱' },
    { code: 'CVE', name: 'Cape Verdean Escudo', symbol: '$' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr.' },
    { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
    { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
    { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk' },
    { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br' },
    { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$' },
    { code: 'FKP', name: 'Falkland Islands Pound', symbol: '£' },
    { code: 'GEL', name: 'Georgian Lari', symbol: '₾' },
    { code: 'GIP', name: 'Gibraltar Pound', symbol: '£' },
    { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D' },
    { code: 'GNF', name: 'Guinean Franc', symbol: 'FG' },
    { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
    { code: 'GYD', name: 'Guyanese Dollar', symbol: '$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'HNL', name: 'Honduran Lempira', symbol: 'L' },
    { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn' },
    { code: 'HTG', name: 'Haitian Gourde', symbol: 'G' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
    { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د' },
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼' },
    { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr' },
    { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$' },
    { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с' },
    { code: 'KHR', name: 'Cambodian Riel', symbol: '៛' },
    { code: 'KMF', name: 'Comorian Franc', symbol: 'CF' },
    { code: 'KPW', name: 'North Korean Won', symbol: '₩' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD' },
    { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$' },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸' },
    { code: 'LAK', name: 'Lao Kip', symbol: '₭' },
    { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs.' },
    { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$' },
    { code: 'LSL', name: 'Lesotho Loti', symbol: 'L' },
    { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD' },
    { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH' },
    { code: 'MDL', name: 'Moldovan Leu', symbol: 'L' },
    { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar' },
    { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден' },
    { code: 'MMK', name: 'Myanmar Kyat', symbol: 'Ks' },
    { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮' },
    { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$' },
    { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM' },
    { code: 'MUR', name: 'Mauritian Rupee', symbol: 'Rs.' },
    { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf' },
    { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'MZN', name: 'Mozambican Metical', symbol: 'MTn' },
    { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$' },
    { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs.' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
    { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.' },
    { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
    { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs.' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł' },
    { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲' },
    { code: 'QAR', name: 'Qatari Rial', symbol: '﷼' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
    { code: 'RSD', name: 'Serbian Dinar', symbol: 'din' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
    { code: 'SBD', name: 'Solomon Islands Dollar', symbol: '$' },
    { code: 'SCR', name: 'Seychellois Rupee', symbol: 'Rs.' },
    { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'SHP', name: 'Saint Helena Pound', symbol: '£' },
    { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh' },
    { code: 'SRD', name: 'Surinamese Dollar', symbol: '$' },
    { code: 'SSP', name: 'South Sudanese Pound', symbol: '£' },
    { code: 'STN', name: 'São Tomé and Príncipe Dobra', symbol: 'Db' },
    { code: 'SVC', name: 'Salvadoran Colón', symbol: '₡' },
    { code: 'SYP', name: 'Syrian Pound', symbol: 'ل.س' },
    { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM' },
    { code: 'TMT', name: 'Turkmenistan Manat', symbol: 'm' },
    { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت' },
    { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: 'TT$' },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'Sh' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
    { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U' },
    { code: 'UZS', name: 'Uzbekistani Soʻm', symbol: 'лв' },
    { code: 'VES', name: 'Venezuelan Bolívar Soberano', symbol: 'Bs.S' },
    { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫' },
    { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'Vt' },
    { code: 'WST', name: 'Samoan Tālā', symbol: 'WS$' },
    { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA' },
    { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$' },
    { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA' },
    { code: 'XPF', name: 'CFP Franc', symbol: '₣' },
    { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK' },
];

interface CurrencySelectProps {
    value?: string;
    onValueChange: (value: string) => void;
    onCurrencySelect?: (currency: Currency) => void;
    className?: string;
    disabled?: boolean;
    variant?: 'default' | 'small';
    placeholder?: string;
}

export const CurrencySelect = ({
    value,
    onValueChange,
    onCurrencySelect,
    className,
    disabled,
    variant = 'default',
    placeholder = 'SLE'
}: CurrencySelectProps) => {
    const handleValueChange = (code: string) => {
        onValueChange(code);
        if (onCurrencySelect) {
            const currency = CURRENCIES.find(c => c.code === code);
            if (currency) onCurrencySelect(currency);
        }
    };

    return (
        <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
            <SelectTrigger className={cn(
                variant === 'small' ? "w-full h-8 text-xs" : "w-[120px] h-11",
                "focus:ring-0",
                className
            )}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{currency.code}</span>
                            <span className="text-muted-foreground text-xs">{currency.symbol}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
