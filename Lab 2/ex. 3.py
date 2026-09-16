x = float(input("Enter the deposit amount:"))
y = float(input("annual rate:"))
z = int(input("deposit term in years:"))
total_amount = x * (1 + y / 100) ** z
print(round(total_amount, 2))