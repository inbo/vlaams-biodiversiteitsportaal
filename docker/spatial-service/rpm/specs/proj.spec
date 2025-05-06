Name:  		proj
Version:    	6.1.1
Release:    	1%{?dist}
Summary:    	Proj
License:    	GPL
Source:    	proj.tar.gz
BuildRequires:gcc make

%description
Accepts a person’s name as a first argument and greets him.

%global debug_package %{nil}

%prep
%setup
./configure --prefix=/usr

%build
%make_build

%install
rm -rf %{buildroot}
%make_install

%files
/usr/bin/*
/usr/lib/*
/usr/share/*
/usr/include/*

%post -p /sbin/ldconfig