import type { ExamplePaymentMethod } from "../../hooks/use-payment-preview";
const methods: readonly { id: ExamplePaymentMethod; title: string; description: string }[] = [
  {
    id: "QRIS",
    title: "QRIS",
    description: "Contoh tampilan pembayaran melalui aplikasi bank atau dompet digital.",
  },
  {
    id: "VA",
    title: "Virtual Account Bank",
    description: "Contoh tampilan kanal bank. Nomor rekening tidak diterbitkan.",
  },
  {
    id: "CARD",
    title: "Kartu Kredit / Debit",
    description: "Contoh tampilan kanal kartu. Tidak meminta data kartu.",
  },
];
export function PaymentMethodChoice({
  method,
  onChange,
  disabled,
}: {
  method: ExamplePaymentMethod;
  onChange: (value: ExamplePaymentMethod) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="billing-methods">
      <legend>Metode pembayaran — contoh tampilan</legend>
      {methods.map((item) => (
        <label
          key={item.id}
          className={`billing-method ${method === item.id ? "billing-method-selected" : ""}`}
        >
          <input
            type="radio"
            name="example-method"
            value={item.id}
            checked={method === item.id}
            disabled={disabled}
            onChange={() => onChange(item.id)}
          />
          <span>
            <strong>{item.title}</strong>
            <small>{item.description}</small>
          </span>
          <span className="badge">Contoh</span>
        </label>
      ))}
    </fieldset>
  );
}
