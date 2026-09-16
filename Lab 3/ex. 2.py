class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance

    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount
            print("Account topped up by", amount)
        else:
            print("The amount must be greater than 0")

    def get_balance(self):
        return self.__balance

    def withdraw(self, amount):
        if amount <= 0:
            print("The withdrawal amount must be greater than 0")
        elif amount > self.__balance:
            print("Insufficient funds")
        else:
            self.__balance -= amount
            print("Withdrawn:", amount)


account = BankAccount("grisha", 10000)

print("Owner:", account.owner)
print("Balance:", account.get_balance())

account.deposit(5000)
print("Balance after deposit:", account.get_balance())

account.withdraw(3000)
print("Balance after withdrawal:", account.get_balance())
