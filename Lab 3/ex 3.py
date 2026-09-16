class ATMAccount:
    def __init__(self, balance, pin):
        self.__balance = balance
        self.__pin = pin

    def check_pin(self, pin):
        return self.__pin == pin

    def get_balance(self, pin):
        if self.check_pin(pin):
            return self.__balance
        else:
            print("Incorrect PIN")

    def deposit(self, pin, amount):
        if self.check_pin(pin):
            if amount > 0:
                self.__balance += amount
                print("Money deposited:", amount)
            else:
                print("Amount must be greater than 0")
        else:
            print("Incorrect PIN")

    def withdraw(self, pin, amount):
        if self.check_pin(pin):
            if amount > self.__balance:
                print("Insufficient funds")
            elif amount <= 0:
                print("Amount must be greater than 0")
            else:
                self.__balance -= amount
                print("Money withdrawn:", amount)
        else:
            print("Incorrect PIN")


account = ATMAccount(10000, "1234")

print("Balance:", account.get_balance("1234"))

account.deposit("1234", 5000)
print("Balance after deposit:", account.get_balance("1234"))

account.withdraw("1234", 3000)
print("Balance after withdrawal:", account.get_balance("1234"))