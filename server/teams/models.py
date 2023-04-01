from django.db.models import Model, AutoField, CharField, TextField

class Team(Model):
    team_id = CharField(primary_key=True, max_length=100, blank=False, null=False)
    team_name = TextField(blank=False, null=False)
    leader_id = CharField(max_length=100, blank=False, null=False)

    def __str__(self):
        return self.team_id

class TeamUserRegistrations(Model):
    id = AutoField(primary_key=True)
    team_id = CharField(max_length=100, blank=False, null=False)
    user_id = CharField(max_length=100, blank=False, null=False)

    def __str__(self):
        return self.id
