def calculate_total(items):
    total = 0
    for item in items:
        total += item["price"]
    return total


def apply_discount(total, discount_percent):
    return total - (total * discount_percent / 100)


def print_invoice(customer_name, items, discount_percent):
    total = calculate_total(items)
    final_total = apply_discount(total, discount_percent)

    print("Invoice for", customer_name)
    print("Items:", len(items))
    print("Final total:", final_total)


items = [
    {"name": "Notebook", "price": 5},
    {"name": "Pen", "price": 2},
]

print_invoice("Demo Customer", items, 10)
