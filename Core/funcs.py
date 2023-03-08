from django.shortcuts import render


def int_decrease_by_percentage(num: int, percent: int) -> int:
    if percent == 0:
        return num
    return round(num - (num / 100 * float(percent)))


def renderInvalid(request, err_msg, redirect):
    return render(request, 'Core/invalid.html',
                  {'invalid': err_msg, 'redirect': redirect})
