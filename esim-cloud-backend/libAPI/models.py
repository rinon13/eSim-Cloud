from djongo import models
from django.utils.safestring import mark_safe
from django.contrib.auth import get_user_model


class LibrarySet(models.Model):
    user = models.ForeignKey(to=get_user_model(), verbose_name="user",
                             on_delete=models.CASCADE)
    default = models.BooleanField(default=False)
    name = models.CharField(max_length=24, default="default")

    class Meta:
        unique_together = ('user', 'name')


class Library(models.Model):
    library_set = models.ForeignKey(
        LibrarySet, null=True,
        verbose_name="library_set",
        on_delete=models.CASCADE
    )
    library_name = models.CharField(max_length=200)
    saved_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.library_name


class LibraryComponent(models.Model):
    name = models.CharField(max_length=200)
    svg_path = models.CharField(max_length=400)
    thumbnail_path = models.CharField(max_length=400)
    description = models.CharField(max_length=400)
    data_link = models.URLField(max_length=200)
    full_name = models.CharField(max_length=200)
    keyword = models.CharField(max_length=200)
    symbol_prefix = models.CharField(max_length=10)
    component_library = models.ForeignKey(
        Library, on_delete=models.CASCADE, null=False, related_name='library')

    # For Django Admin Panel
    def image_tag(self):
        if self.svg_path:
            return mark_safe('<img src="/%s" style="width: 45px; height:45px;" />' % self.svg_path)  # noqa
        else:
            return 'No Image Found'
    image_tag.short_description = 'Image'

    def __str__(self):
        return self.name


class ComponentAlternate(models.Model):
    part = models.CharField(max_length=1)
    dmg = models.PositiveSmallIntegerField()
    full_name = models.CharField(max_length=200)
    svg_path = models.CharField(max_length=400)
    parent_component = models.ForeignKey(
        LibraryComponent,
        on_delete=models.CASCADE,
        null=False,
        related_name='alternate_component')

    # For Django Admin Panel
    def image_tag(self):
        if self.svg_path:
            return mark_safe('<img src="/%s" style="width: 45px; height:45px;" />' % self.svg_path)  # noqa
        else:
            return 'No Image Found'

    image_tag.short_description = 'Image'

    def __str__(self):
        return self.full_name


class FavouriteComponent(models.Model):
    owner = models.OneToOneField(to=get_user_model(),
                                 on_delete=models.CASCADE, null=False)
    component = models.ManyToManyField(to=LibraryComponent)
    last_change = models.DateTimeField(auto_now=True)
