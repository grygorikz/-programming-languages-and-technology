class student:
    def _init_ (self, name, age, speciality):
        self.name = name
        self.age = age
        self.speciality = speciality

    def show_info(self):
        print("Name", self.name)
        print("age", self.age)
        print("speciality", self.speciality)

    def change_speicality(self, new_speciality):
        self.speciality = new_speciality
        student = student("grisha", 19, "programming languages")
        print("student infromation:")
        student.show_info()
        student.change_speciality("informational system")
        print("after speciality change:")
        student.show_info()